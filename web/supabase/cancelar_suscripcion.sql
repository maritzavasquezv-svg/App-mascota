-- Cancelar la suscripción desde Kopeet con un clic (12 nov 2026).
-- La dueña pega en el panel las credenciales de la API de Hotmart; la función Edge "cancelar-suscripcion"
-- las usa para pedirle a Hotmart la cancelación. Luego llega el aviso SUBSCRIPTION_CANCELLATION y el acceso
-- sigue hasta el fin del período pagado.

-- Guardar credenciales (solo administradoras).
create or replace function public.admin_guardar_hotmart_api(p_client_id text, p_client_secret text, p_basic text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  if length(trim(p_client_id)) < 8 or length(trim(p_client_secret)) < 8 or length(trim(p_basic)) < 8 then
    raise exception 'credenciales_invalidas' using errcode = '22023';
  end if;
  insert into privado.secretos (clave, valor) values
    ('hotmart_client_id', trim(p_client_id)),
    ('hotmart_client_secret', trim(p_client_secret)),
    ('hotmart_basic', regexp_replace(trim(p_basic), '^Basic\s+', '', 'i'))
  on conflict (clave) do update set valor = excluded.valor, actualizado_en = now();
end $$;

create or replace function public.admin_hotmart_api_estado() returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  return (select count(*) = 3 from privado.secretos where clave in ('hotmart_client_id', 'hotmart_client_secret', 'hotmart_basic'));
end $$;

-- Para la función Edge (service_role): credenciales + datos de la suscripción de un correo.
create or replace function public.hotmart_cancelacion_datos(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'client_id', (select valor from privado.secretos where clave = 'hotmart_client_id'),
    'client_secret', (select valor from privado.secretos where clave = 'hotmart_client_secret'),
    'basic', (select valor from privado.secretos where clave = 'hotmart_basic'),
    'suscripcion', (select jsonb_build_object('estado', s.estado, 'origen', s.origen, 'ultimo_evento', s.ultimo_evento, 'vence_en', s.vence_en)
                    from public.suscripciones s where lower(s.email) = lower(p_email)),
    'codigo', (select v.payload #>> '{data,subscription,subscriber,code}' from public.ventas v
               where lower(v.email) = lower(p_email) and v.evento in ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
                 and v.payload #>> '{data,subscription,subscriber,code}' is not null
               order by v.fecha desc limit 1),
    'proximo_cobro', (select v.payload #>> '{data,purchase,date_next_charge}' from public.ventas v
               where lower(v.email) = lower(p_email) and v.evento = 'PURCHASE_APPROVED'
               order by v.fecha desc limit 1)
  );
$$;

-- La función Edge registra la cancelación al instante (sin esperar el aviso de Hotmart, que la confirma después).
create or replace function public.hotmart_marcar_cancelada(p_email text, p_fin timestamptz) returns void
language sql security definer set search_path = '' as $$
  update public.suscripciones
     set ultimo_evento = 'SUBSCRIPTION_CANCELLATION',
         vence_en = case when p_fin is not null and p_fin > now() then p_fin else now() end,
         actualizado_en = now()
   where lower(email) = lower(p_email);
$$;

revoke all on function public.admin_guardar_hotmart_api(text, text, text) from public, anon;
revoke all on function public.admin_hotmart_api_estado() from public, anon;
grant execute on function public.admin_guardar_hotmart_api(text, text, text) to authenticated;
grant execute on function public.admin_hotmart_api_estado() to authenticated;
revoke all on function public.hotmart_cancelacion_datos(text) from public, anon, authenticated;
revoke all on function public.hotmart_marcar_cancelada(text, timestamptz) from public, anon, authenticated;
grant execute on function public.hotmart_cancelacion_datos(text) to service_role;
grant execute on function public.hotmart_marcar_cancelada(text, timestamptz) to service_role;
