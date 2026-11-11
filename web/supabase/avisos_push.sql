-- Recordatorios por notificación push (gratis, sin dominio). 11 nov 2026.
-- Flujo: el celular da permiso → la app guarda su "dirección push" (push_guardar) →
-- pg_cron cada 15 min llama a la función Edge "enviar-avisos" → esta pide la lista (push_preparar) y la envía.
-- Las claves VAPID las genera la propia función Edge la primera vez y quedan en privado.secretos (nadie las ve).

-- ===== Tablas =====
create table if not exists public.push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  zona text not null default 'America/Santiago',
  idioma text not null default 'es',
  creado_en timestamptz not null default now()
);
create index if not exists push_suscripciones_usuario on public.push_suscripciones (usuario_id);
alter table public.push_suscripciones enable row level security;
drop policy if exists "avisos propios: ver" on public.push_suscripciones;
create policy "avisos propios: ver" on public.push_suscripciones for select to authenticated using ((select auth.uid()) = usuario_id);

-- Qué recordatorio ya se envió (para no repetirlo). Sin políticas: solo lo usan las funciones.
create table if not exists public.push_enviados (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  clave text not null,
  creado_en timestamptz not null default now(),
  primary key (usuario_id, clave)
);
alter table public.push_enviados enable row level security;

-- Avisos de prueba pedidos desde la app.
create table if not exists public.push_pruebas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  creado_en timestamptz not null default now(),
  procesado boolean not null default false
);
alter table public.push_pruebas enable row level security;

-- Clave interna para que solo pg_cron pueda pedir el envío.
insert into privado.secretos (clave, valor)
values ('push_cron', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (clave) do nothing;

-- ===== Texto en 3 idiomas =====
create or replace function privado.txt(i text, es text, en text, pt text) returns text
language sql immutable set search_path = '' as $$ select case i when 'en' then en when 'pt' then pt else es end $$;

-- ===== Funciones para la app (persona con sesión) =====
create or replace function public.push_clave_publica() returns text
language sql stable security definer set search_path = '' as $$
  select valor from privado.secretos where clave = 'vapid_publica';
$$;

create or replace function public.push_guardar(p_endpoint text, p_p256dh text, p_auth text, p_zona text, p_idioma text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'No hay sesión iniciada'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 or length(p_p256dh) > 200 or length(p_auth) > 100 then
    raise exception 'Datos de aviso inválidos' using errcode = '22023';
  end if;
  delete from public.push_suscripciones where endpoint = p_endpoint;
  insert into public.push_suscripciones (usuario_id, endpoint, p256dh, auth, zona, idioma)
  values (uid, p_endpoint, p_p256dh, p_auth,
          case when exists (select 1 from pg_catalog.pg_timezone_names where name = p_zona) then p_zona else 'America/Santiago' end,
          case when p_idioma in ('es', 'en', 'pt') then p_idioma else 'es' end);
  -- Máximo 10 dispositivos por persona: se borran los más antiguos.
  delete from public.push_suscripciones where id in (
    select id from public.push_suscripciones where usuario_id = uid order by creado_en desc offset 10);
end $$;

create or replace function public.push_quitar(p_endpoint text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_suscripciones where endpoint = p_endpoint and usuario_id = auth.uid();
$$;

-- Llama a la función Edge (la usan pg_cron y el botón de prueba).
create or replace function privado.disparar_avisos() returns bigint
language plpgsql security definer set search_path = '' as $$
declare rid bigint;
begin
  select net.http_post(
    url := 'https://tgfcqlhdyvmlsmipbnvw.supabase.co/functions/v1/enviar-avisos',
    headers := jsonb_build_object('Content-Type', 'application/json',
                                  'x-kopeet-cron', (select valor from privado.secretos where clave = 'push_cron')),
    body := '{}'::jsonb
  ) into rid;
  return rid;
end $$;

create or replace function public.push_pedir_prueba() returns boolean
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'No hay sesión iniciada'; end if;
  if not exists (select 1 from public.push_suscripciones where usuario_id = uid) then return false; end if;
  -- Máximo una prueba por minuto.
  if exists (select 1 from public.push_pruebas where usuario_id = uid and creado_en > now() - interval '1 minute') then return true; end if;
  insert into public.push_pruebas (usuario_id) values (uid);
  perform privado.disparar_avisos();
  return true;
end $$;

-- ===== Funciones solo para la función Edge (service_role) =====
create or replace function public.push_cron_valido(p_token text) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_token is not null and p_token = (select valor from privado.secretos where clave = 'push_cron');
$$;

create or replace function public.push_config() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'publica', (select valor from privado.secretos where clave = 'vapid_publica'),
    'privada', (select valor from privado.secretos where clave = 'vapid_privada'));
$$;

create or replace function public.push_guardar_vapid(p_publica text, p_privada text) returns void
language sql security definer set search_path = '' as $$
  insert into privado.secretos (clave, valor) values ('vapid_publica', p_publica), ('vapid_privada', p_privada)
  on conflict (clave) do nothing;
$$;

create or replace function public.push_borrar_endpoint(p_endpoint text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_suscripciones where endpoint = p_endpoint;
$$;

-- Arma los recordatorios que tocan ahora y los marca como enviados (una vez por persona, tipo y día).
create or replace function public.push_preparar() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  salida jsonb := '[]'::jsonb;
  c record;
  s record;
begin
  delete from public.push_enviados where creado_en < now() - interval '60 days';

  for c in
    with u as (
      select distinct on (x.usuario_id) x.usuario_id, x.idioma, (now() at time zone x.zona) as loc
      from public.push_suscripciones x order by x.usuario_id, x.creado_en desc
    ),
    perro1 as (
      select u.*, (select p.nombre from public.perros p where p.usuario_id = u.usuario_id order by p.creado_en limit 1) as perro,
             (select count(*) from public.perros p where p.usuario_id = u.usuario_id) as n_perros
      from u
    )
    -- 1) Paseo: a la hora que eligió, si hoy aún no anotó ejercicio.
    select k.usuario_id, 'paseo-' || (k.loc)::date as clave, 'paseo' as tag, '/inicio' as url,
      privado.txt(k.idioma,
        case when k.n_perros > 1 then '🐕 Hora del paseo' else '🐕 Hora del paseo de ' || k.perro end,
        case when k.n_perros > 1 then '🐕 Walk time' else '🐕 Time for ' || k.perro || '''s walk' end,
        case when k.n_perros > 1 then '🐕 Hora do passeio' else '🐕 Hora do passeio de ' || k.perro end) as titulo,
      privado.txt(k.idioma,
        'Un paseo hoy, y anótalo en Kopeet para sumar a su racha.',
        'A walk today, then log it in Kopeet to keep the streak.',
        'Um passeio hoje, e anote no Kopeet para somar à sequência.') as cuerpo
    from perro1 k join public.perfiles pf on pf.id = k.usuario_id
    where k.perro is not null
      and extract(hour from k.loc) = case pf.hora_paseo when 'manana' then 7 when 'mediodia' then 13 when 'tarde' then 18 when 'noche' then 21 end
      and not exists (select 1 from public.registros g where g.usuario_id = k.usuario_id and g.fecha = (k.loc)::date and g.tipo in ('ejercicio', 'paseo', 'juego'))

    union all
    -- 2) Salud: vacunas, desparasitación y controles, 3 días antes y el mismo día, a las 10:00.
    select u.usuario_id, 'salud-' || e.id || '-' || (e.fecha - (u.loc)::date), 'salud-' || e.id, '/inicio',
      privado.txt(u.idioma,
        case e.tipo when 'vacuna' then '💉 ' when 'desparasitacion' then '💊 ' when 'control' then '🩺 ' else '📅 ' end
          || case when e.fecha = (u.loc)::date then 'Hoy: ' else 'En 3 días: ' end || e.titulo || ' de ' || p.nombre,
        case e.tipo when 'vacuna' then '💉 ' when 'desparasitacion' then '💊 ' when 'control' then '🩺 ' else '📅 ' end
          || case when e.fecha = (u.loc)::date then 'Today: ' else 'In 3 days: ' end || e.titulo || ' for ' || p.nombre,
        case e.tipo when 'vacuna' then '💉 ' when 'desparasitacion' then '💊 ' when 'control' then '🩺 ' else '📅 ' end
          || case when e.fecha = (u.loc)::date then 'Hoje: ' else 'Em 3 dias: ' end || e.titulo || ' de ' || p.nombre),
      privado.txt(u.idioma, 'Revisa los detalles en Kopeet.', 'Check the details in Kopeet.', 'Veja os detalhes no Kopeet.')
    from u
    join public.eventos_salud e on e.usuario_id = u.usuario_id and not e.hecho
                                and e.fecha in ((u.loc)::date, (u.loc)::date + 3)
    join public.perros p on p.id = e.perro_id
    where extract(hour from u.loc) = 10

    union all
    -- 3) Racha: a las 20:00, si lleva 2 o más días seguidos y hoy aún no anota ejercicio.
    select r.usuario_id, 'racha-' || (r.loc)::date, 'racha', '/inicio',
      privado.txt(r.idioma, '🔥 ¡' || r.dias || ' días seguidos con ' || r.perro || '!',
                            '🔥 ' || r.dias || ' days in a row with ' || r.perro || '!',
                            '🔥 ' || r.dias || ' dias seguidos com ' || r.perro || '!'),
      privado.txt(r.idioma, 'Anota el ejercicio de hoy para no cortar la racha.',
                            'Log today''s exercise so you don''t break the streak.',
                            'Anote o exercício de hoje para não quebrar a sequência.')
    from (
      select k.*, (select min(d) - 1 from generate_series(1, 31) d
                   where not exists (select 1 from public.registros g where g.usuario_id = k.usuario_id
                                     and g.tipo in ('ejercicio', 'paseo', 'juego') and g.fecha = (k.loc)::date - d)) as dias
      from perro1 k
      where k.perro is not null and extract(hour from k.loc) = 20
        and not exists (select 1 from public.registros g where g.usuario_id = k.usuario_id and g.fecha = (k.loc)::date and g.tipo in ('ejercicio', 'paseo', 'juego'))
    ) r
    where r.dias >= 2

    union all
    -- 4) Avisos de prueba pedidos desde la app.
    select t.usuario_id, 'prueba-' || t.id, 'prueba', '/inicio/cuenta',
      privado.txt(coalesce(u.idioma, 'es'), '✅ Los avisos de Kopeet funcionan', '✅ Kopeet reminders are working', '✅ Os avisos do Kopeet funcionam'),
      privado.txt(coalesce(u.idioma, 'es'), 'Así te recordaremos el paseo, las vacunas y tu racha.',
                  'This is how we''ll remind you about walks, vaccines and your streak.',
                  'É assim que lembraremos você do passeio, das vacinas e da sequência.')
    from public.push_pruebas t left join u on u.usuario_id = t.usuario_id
    where not t.procesado and t.creado_en > now() - interval '1 hour'
  loop
    insert into public.push_enviados (usuario_id, clave) values (c.usuario_id, c.clave) on conflict do nothing;
    if found then
      for s in select endpoint, p256dh, auth from public.push_suscripciones where usuario_id = c.usuario_id loop
        salida := salida || jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
          'mensaje', jsonb_build_object('titulo', c.titulo, 'cuerpo', c.cuerpo, 'url', c.url, 'tag', c.tag));
      end loop;
    end if;
  end loop;

  update public.push_pruebas set procesado = true where not procesado;
  return salida;
end $$;

-- ===== Permisos =====
revoke all on function privado.txt(text, text, text, text) from public, anon, authenticated;
revoke all on function privado.disparar_avisos() from public, anon, authenticated;
revoke all on function public.push_clave_publica() from public, anon;
revoke all on function public.push_guardar(text, text, text, text, text) from public, anon;
revoke all on function public.push_quitar(text) from public, anon;
revoke all on function public.push_pedir_prueba() from public, anon;
grant execute on function public.push_clave_publica() to authenticated;
grant execute on function public.push_guardar(text, text, text, text, text) to authenticated;
grant execute on function public.push_quitar(text) to authenticated;
grant execute on function public.push_pedir_prueba() to authenticated;

revoke all on function public.push_cron_valido(text) from public, anon, authenticated;
revoke all on function public.push_config() from public, anon, authenticated;
revoke all on function public.push_guardar_vapid(text, text) from public, anon, authenticated;
revoke all on function public.push_borrar_endpoint(text) from public, anon, authenticated;
revoke all on function public.push_preparar() from public, anon, authenticated;
grant execute on function public.push_cron_valido(text) to service_role;
grant execute on function public.push_config() to service_role;
grant execute on function public.push_guardar_vapid(text, text) to service_role;
grant execute on function public.push_borrar_endpoint(text) to service_role;
grant execute on function public.push_preparar() to service_role;

-- ===== Cada 15 minutos =====
select cron.unschedule('kopeet-avisos-push') where exists (select 1 from cron.job where jobname = 'kopeet-avisos-push');
select cron.schedule('kopeet-avisos-push', '*/15 * * * *', 'select privado.disparar_avisos()');
