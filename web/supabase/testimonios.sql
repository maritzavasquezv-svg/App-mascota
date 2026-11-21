-- Recomendaciones de clientes (21 nov 2026, auditoría H4): la persona la escribe en Cuenta, la dueña la aprueba
-- en el Panel y solo entonces aparece en la página de ventas. Nunca se publica nada sin permiso explícito.
create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 40),
  ciudad text not null check (char_length(ciudad) between 2 and 40),
  mascota text not null check (char_length(mascota) between 1 and 30),
  frase text not null check (char_length(frase) between 10 and 280),
  idioma text not null default 'es' check (idioma in ('es', 'en', 'pt')),
  acepta_publicar boolean not null check (acepta_publicar),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  creado_en timestamptz not null default now()
);
alter table public.testimonios enable row level security;
drop policy if exists "testimonio propio: ver" on public.testimonios;
create policy "testimonio propio: ver" on public.testimonios for select to authenticated using ((select auth.uid()) = usuario_id);
revoke insert, update, delete on public.testimonios from anon, authenticated;

-- Enviar o corregir la propia recomendación (vuelve a quedar pendiente de revisión).
create or replace function public.enviar_testimonio(p_nombre text, p_ciudad text, p_mascota text, p_frase text, p_idioma text, p_acepta boolean)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if auth.uid() is null then raise exception 'Inicia sesión' using errcode = '42501'; end if;
  if not coalesce(p_acepta, false) then raise exception 'Falta tu permiso para publicarla' using errcode = '22023'; end if;
  insert into public.testimonios (usuario_id, nombre, ciudad, mascota, frase, idioma, acepta_publicar)
  values (auth.uid(), trim(p_nombre), trim(p_ciudad), trim(p_mascota), trim(p_frase), coalesce(p_idioma, 'es'), true)
  on conflict (usuario_id) do update set nombre = excluded.nombre, ciudad = excluded.ciudad, mascota = excluded.mascota,
    frase = excluded.frase, idioma = excluded.idioma, acepta_publicar = true, estado = 'pendiente', creado_en = now();
end $$;

create or replace function public.borrar_mi_testimonio()
returns void language sql security definer set search_path to '' as $$
  delete from public.testimonios where usuario_id = auth.uid();
$$;

-- Lo que ve cualquiera en la página de ventas: solo las aprobadas, sin datos de la cuenta.
create or replace function public.testimonios_publicos()
returns jsonb language sql stable security definer set search_path to '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('nombre', nombre, 'ciudad', ciudad, 'mascota', mascota, 'frase', frase, 'idioma', idioma) order by creado_en desc), '[]'::jsonb)
    from (select * from public.testimonios where estado = 'aprobado' order by creado_en desc limit 6) t;
$$;

create or replace function public.admin_testimonios()
returns jsonb language plpgsql security definer set search_path to '' as $$
begin
  perform public.exigir_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'nombre', t.nombre, 'ciudad', t.ciudad, 'mascota', t.mascota, 'frase', t.frase,
      'idioma', t.idioma, 'estado', t.estado, 'creado_en', t.creado_en, 'email', u.email) order by (t.estado = 'pendiente') desc, t.creado_en desc)
    from public.testimonios t left join auth.users u on u.id = t.usuario_id), '[]'::jsonb);
end $$;

create or replace function public.admin_moderar_testimonio(p_id uuid, p_estado text)
returns void language plpgsql security definer set search_path to '' as $$
begin
  perform public.exigir_admin();
  if p_estado not in ('aprobado', 'rechazado', 'pendiente') then raise exception 'estado inválido' using errcode = '22023'; end if;
  update public.testimonios set estado = p_estado where id = p_id;
end $$;

revoke all on function public.enviar_testimonio(text, text, text, text, text, boolean) from public, anon;
revoke all on function public.borrar_mi_testimonio() from public, anon;
revoke all on function public.admin_testimonios() from public, anon;
revoke all on function public.admin_moderar_testimonio(uuid, text) from public, anon;
grant execute on function public.enviar_testimonio(text, text, text, text, text, boolean) to authenticated;
grant execute on function public.borrar_mi_testimonio() to authenticated;
grant execute on function public.admin_testimonios() to authenticated;
grant execute on function public.admin_moderar_testimonio(uuid, text) to authenticated;
grant execute on function public.testimonios_publicos() to anon, authenticated;
