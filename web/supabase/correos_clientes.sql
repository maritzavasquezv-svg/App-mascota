-- Correos a clientes por Gmail (20 nov 2026): "tu pago no pasó" (auditoría H5) y aviso antes del primer cobro.
-- La clave de aplicación de Gmail la pega la dueña en el Panel; se guarda en privado.secretos (nadie la ve).
-- La función Edge "enviar-correos" pide la lista a correos_preparar(), envía y marca cada correo como enviado.

create table if not exists privado.correos_enviados (
  clave text primary key,
  email text not null,
  tipo text not null,
  enviado_en timestamptz not null default now()
);
revoke all on privado.correos_enviados from public, anon, authenticated;

create or replace function public.admin_guardar_gmail(p_usuario text, p_clave text)
returns void language plpgsql security definer set search_path to '' as $$
declare c text := regexp_replace(coalesce(p_clave, ''), '\s', '', 'g');
begin
  perform public.exigir_admin();
  if p_usuario !~* '^[^@\s]+@gmail\.com$' then raise exception 'Usa un correo @gmail.com' using errcode = '22023'; end if;
  if length(c) <> 16 then raise exception 'La contraseña de aplicación tiene 16 letras' using errcode = '22023'; end if;
  insert into privado.secretos (clave, valor) values ('gmail_usuario', lower(trim(p_usuario))), ('gmail_clave', c)
  on conflict (clave) do update set valor = excluded.valor, actualizado_en = now();
end $$;

create or replace function public.admin_gmail_estado()
returns jsonb language plpgsql security definer set search_path to '' as $$
begin
  perform public.exigir_admin();
  return jsonb_build_object(
    'usuario', (select valor from privado.secretos where clave = 'gmail_usuario'),
    'listo', exists (select 1 from privado.secretos where clave = 'gmail_clave'),
    'enviados', (select count(*) from privado.correos_enviados where tipo <> 'prueba'));
end $$;

-- Lista de correos por enviar (solo la llama la función Edge con la clave de servicio).
create or replace function public.correos_preparar()
returns jsonb language sql stable security definer set search_path to '' as $$
  with cfg as (
    select (select valor from privado.secretos where clave = 'gmail_usuario') usuario,
           (select valor from privado.secretos where clave = 'gmail_clave') clave
  ),
  fallidos as (
    select 'pago_fallido:' || s.email || ':' || to_char(s.evento_en, 'YYYYMMDD') clave, s.email, 'pago_fallido' tipo,
           jsonb_build_object('hasta', s.vence_en, 'plan', s.plan) datos
      from public.suscripciones s
     where s.estado = 'activa' and s.vence_en > now()
       and s.ultimo_evento in ('PURCHASE_DELAYED', 'PURCHASE_EXPIRED', 'PURCHASE_CANCELED')
  ),
  pruebas as (
    select distinct on (v.email) 'aviso_cobro:' || v.transaccion clave, lower(v.email) email, 'aviso_cobro' tipo,
           jsonb_build_object('cobro', privado.fecha_hotmart(v.payload #>> '{data,purchase,date_next_charge}'), 'plan', v.plan) datos
      from public.ventas v
      join public.suscripciones s on s.email = lower(v.email)
     where v.evento = 'PURCHASE_APPROVED' and coalesce(v.bruto, 0) = 0 and v.transaccion is not null
       and s.estado = 'activa' and s.ultimo_evento not in ('SUBSCRIPTION_CANCELLATION')
       and privado.fecha_hotmart(v.payload #>> '{data,purchase,date_next_charge}') between now() and now() + interval '3 days'
     order by v.email, v.fecha desc
  ),
  todos as (select * from fallidos union all select * from pruebas)
  select jsonb_build_object(
    'usuario', (select usuario from cfg), 'clave', (select clave from cfg),
    'correos', coalesce((select jsonb_agg(jsonb_build_object('clave', t.clave, 'email', t.email, 'tipo', t.tipo, 'datos', t.datos,
        'idioma', coalesce((select u.raw_user_meta_data ->> 'idioma' from auth.users u where lower(u.email) = t.email limit 1), 'es')))
      from todos t where not exists (select 1 from privado.correos_enviados e where e.clave = t.clave)), '[]'::jsonb));
$$;

create or replace function public.correos_marcar(p_clave text, p_email text, p_tipo text)
returns void language sql security definer set search_path to '' as $$
  insert into privado.correos_enviados (clave, email, tipo) values (p_clave, p_email, p_tipo) on conflict (clave) do nothing;
$$;

revoke all on function public.correos_preparar() from public, anon, authenticated;
revoke all on function public.correos_marcar(text, text, text) from public, anon, authenticated;
grant execute on function public.correos_preparar() to service_role;
grant execute on function public.correos_marcar(text, text, text) to service_role;
revoke all on function public.admin_guardar_gmail(text, text) from public, anon;
revoke all on function public.admin_gmail_estado() from public, anon;
grant execute on function public.admin_guardar_gmail(text, text) to authenticated;
grant execute on function public.admin_gmail_estado() to authenticated;

-- Dispara la función Edge (cada hora con pg_cron, o una prueba desde el Panel).
create or replace function privado.disparar_correos(p_prueba boolean default false)
returns bigint language plpgsql security definer set search_path to '' as $$
declare rid bigint;
begin
  select net.http_post(
    url := 'https://tgfcqlhdyvmlsmipbnvw.supabase.co/functions/v1/enviar-correos',
    headers := jsonb_build_object('Content-Type', 'application/json',
                                  'x-kopeet-cron', (select valor from privado.secretos where clave = 'push_cron')),
    body := jsonb_build_object('prueba', p_prueba)
  ) into rid;
  return rid;
end $$;

create or replace function public.admin_correo_prueba()
returns void language plpgsql security definer set search_path to '' as $$
begin
  perform public.exigir_admin();
  perform privado.disparar_correos(true);
end $$;
revoke all on function public.admin_correo_prueba() from public, anon;
grant execute on function public.admin_correo_prueba() to authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'kopeet-correos';
select cron.schedule('kopeet-correos', '7 * * * *', 'select privado.disparar_correos(false)');
