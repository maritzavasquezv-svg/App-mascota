-- Resumen semanal por correo para la dueña (copia de lo aplicado en Supabase, 11 nov 2026).
-- Todo vive en la base: pg_cron lo dispara los lunes y pg_net lo envía por Resend.
-- La API key de Resend la pega la dueña en el panel (/admin → Ajustes); queda en privado.secretos.

create extension if not exists pg_net;
create extension if not exists pg_cron;

create table if not exists privado.envios_resumen (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  prueba boolean not null default false,
  request_id bigint,
  destinatarios text[],
  nota text
);

-- US$ con formato chileno: US$ 1.234,56
create or replace function privado.usd(x numeric) returns text
language sql immutable set search_path = '' as $$
  select case when x is null then 'Sin datos'
    else (case when x < 0 then '−' else '' end) || 'US$ ' || translate(to_char(abs(x), 'FM999,999,990.00'), ',.', '.,') end;
$$;

-- Números de los últimos 7 días (misma lógica que el panel: ventas aprobadas sin reembolso)
create or replace function privado.resumen_semanal_datos() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  desde timestamptz := now() - interval '7 days';
  r jsonb;
begin
  with
  reemb as (select distinct transaccion from public.ventas where tipo_baja = 'reembolso' and transaccion is not null),
  aprob as (select v.* from public.ventas v where v.evento = 'PURCHASE_APPROVED' and v.fecha >= desde
              and (v.transaccion is null or v.transaccion not in (select transaccion from reemb))),
  act as (
    select usuario_id as u from public.eventos where usuario_id is not null and creado_en >= desde
    union select usuario_id from public.registros where creado_en >= desde
    union select usuario_id from public.usos_ia where creado_en >= desde
    union select id from auth.users where last_sign_in_at >= desde
  ),
  aj as (select * from public.ajustes_negocio where id = 1)
  select jsonb_build_object(
    'desde', desde, 'hasta', now(),
    'compras', (select count(*) from aprob),
    'bruto', coalesce((select sum(bruto) from aprob), 0),
    'hotmart', coalesce((select sum(comision_hotmart) from aprob), 0),
    'afiliados', coalesce((select sum(comision_afiliado) from aprob), 0),
    'sinMontos', (select count(*) from aprob where comision_hotmart is null),
    'impuestoPct', (select impuesto_pct from aj),
    'configurado', (select configurado from aj),
    'fijosSemana', (select (infra_usd_mes + email_usd_mes) * 7 / 30.0 from aj),
    'publicidadSemana', coalesce((select sum(monto_usd) from public.gastos_publicidad where mes = date_trunc('month', now())::date), 0) * 7 / 30.0,
    'ia', coalesce((select sum(costo_usd) from public.usos_ia where creado_en >= desde), 0),
    'usosIa', (select count(*) from public.usos_ia where creado_en >= desde),
    'usosIaSinCosto', (select count(*) from public.usos_ia where creado_en >= desde and costo_usd is null),
    'nuevos', (select count(*) from auth.users where created_at >= desde),
    'totalUsuarios', (select count(*) from auth.users),
    'activos', (select count(distinct u) from act),
    'voluntarias', (select count(*) from public.ventas where tipo_baja = 'voluntaria' and fecha >= desde),
    'involuntarias', (select count(*) from public.ventas where tipo_baja = 'involuntaria' and fecha >= desde),
    'reembolsos', (select count(*) from public.ventas where tipo_baja = 'reembolso' and fecha >= desde),
    'clientesPagando', (select count(*) from public.suscripciones where estado = 'activa' and origen = 'hotmart'),
    'hottok', exists (select 1 from privado.secretos where clave = 'hotmart_hottok'),
    'fallosHotmart', (select count(*) from public.avisos_hotmart where not ok and recibido_en >= desde),
    'ultimoAvisoOk', (select ok from public.avisos_hotmart order by recibido_en desc limit 1),
    'errores', (select count(*) from public.errores where creado_en >= desde),
    'erroresAbiertos', (select count(*) from public.errores where not resuelto)
  ) into r;
  return r;
end; $$;

-- Arma el correo (HTML en español) y lo envía con Resend. Devuelve el id de la petición de pg_net.
create or replace function privado.enviar_resumen_semanal(p_prueba boolean default false) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  clave text := (select valor from privado.secretos where clave = 'resend_api_key');
  para text[] := (select array_agg(email) from public.administradores);
  d jsonb := privado.resumen_semanal_datos();
  bruto numeric := (d ->> 'bruto')::numeric;
  impuestos numeric := bruto * coalesce((d ->> 'impuestoPct')::numeric, 0) / 100;
  ia_sin_dato boolean := (d ->> 'usosIa')::int > 0 and (d ->> 'usosIa')::int = (d ->> 'usosIaSinCosto')::int;
  costos numeric := coalesce((d ->> 'hotmart')::numeric, 0) + coalesce((d ->> 'afiliados')::numeric, 0) + impuestos
                    + coalesce((d ->> 'ia')::numeric, 0) + coalesce((d ->> 'fijosSemana')::numeric, 0) + coalesce((d ->> 'publicidadSemana')::numeric, 0);
  limpio numeric := bruto - costos;
  avisos text := '';
  hay_grave boolean := false;
  fila text := '<tr><td style="padding:7px 0;color:#4a5878">%s</td><td style="padding:7px 0;text-align:right;font-weight:700;color:#0f1b3d">%s</td></tr>';
  cuerpo text; asunto text; rid bigint;
begin
  if clave is null then
    if p_prueba then raise exception 'falta_resend' using errcode = 'P0001'; end if;
    return null;
  end if;
  if para is null then return null; end if;

  -- Avisos (qué pasó → qué hacer)
  if bruto > 0 and (d ->> 'ia')::numeric / bruto > 0.2 then
    hay_grave := true;
    avisos := avisos || format('<li><b>La IA se llevó el %s%% de lo vendido.</b> Revisa en el panel quién la usa más.</li>', round((d ->> 'ia')::numeric / bruto * 100));
  end if;
  if (d ->> 'hottok')::boolean and (d ->> 'fallosHotmart')::int > 0 and (d ->> 'ultimoAvisoOk') = 'false' then
    hay_grave := true;
    avisos := avisos || format('<li><b>Hotmart tuvo %s avisos con error.</b> Alguien que pagó podría no tener acceso: revisa «Salud» y da acceso a mano si hace falta.</li>', d ->> 'fallosHotmart');
  end if;
  if bruto > 0 and limpio < 0 then
    hay_grave := true;
    avisos := avisos || '<li><b>Esta semana los costos superaron lo vendido.</b> Mira «Ganancia real» para ver qué costo pesa más.</li>';
  end if;
  if (d ->> 'errores')::int >= 5 then
    hay_grave := true;
    avisos := avisos || format('<li><b>%s errores en la semana.</b> Revisa «Salud» en el panel.</li>', d ->> 'errores');
  end if;
  if (d ->> 'involuntarias')::int >= 2 then
    hay_grave := true;
    avisos := avisos || format('<li><b>%s personas se fueron porque falló su pago.</b> Escríbeles para que actualicen su tarjeta en Hotmart.</li>', d ->> 'involuntarias');
  end if;
  if not (d ->> 'hottok')::boolean then
    avisos := avisos || '<li>Hotmart todavía no está conectado: las ventas no llegan al panel.</li>';
  end if;

  asunto := case when bruto > 0 then format('Kopeet: vendiste %s y te quedaron %s esta semana', privado.usd(bruto), privado.usd(limpio))
                 else 'Kopeet: tu resumen de la semana' end;
  if p_prueba then asunto := '[Prueba] ' || asunto; end if;

  cuerpo := '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f1b3d">'
    || '<h1 style="font-size:20px;margin:0 0 4px">Resumen semanal de Kopeet</h1>'
    || format('<p style="color:#5b6885;margin:0 0 18px;font-size:13px">Del %s al %s</p>', to_char((d ->> 'desde')::timestamptz at time zone 'America/Santiago', 'DD/MM'), to_char((d ->> 'hasta')::timestamptz at time zone 'America/Santiago', 'DD/MM/YYYY'))
    || '<div style="background:#2f6bff;color:#fff;border-radius:14px;padding:16px 18px;margin-bottom:16px">'
    || case when bruto > 0 then
         format('<p style="margin:0;font-size:14px">Vendiste</p><p style="margin:2px 0;font-size:28px;font-weight:700">%s</p><p style="margin:0;font-size:14px">y te quedaron <b>%s limpios</b>%s.</p>',
           privado.usd(bruto), privado.usd(limpio), case when bruto > 0 then format(' (%s%% de margen)', round(limpio / bruto * 100)) else '' end)
       else '<p style="margin:0;font-size:18px;font-weight:700">Sin ventas esta semana</p>'
            || format('<p style="margin:4px 0 0;font-size:14px">Los costos de la semana suman %s.</p>', privado.usd(costos)) end
    || '</div>'
    || '<div style="border:1px solid ' || case when hay_grave then '#f3b4b0;background:#fff4f3' else '#bfe5cd;background:#f1fbf5' end || ';border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:14px">'
    || case when hay_grave then '<b>⚠️ Para revisar</b>' else '<b>✅ Todo en orden</b>' end
    || case when avisos <> '' then '<ul style="margin:8px 0 0;padding-left:18px;line-height:1.5">' || avisos || '</ul>' else '' end
    || '</div>'
    || '<table style="width:100%;border-collapse:collapse;font-size:14px">'
    || format(fila, 'Compras', d ->> 'compras')
    || format(fila, 'Comisión de Hotmart', case when (d ->> 'compras')::int > 0 and (d ->> 'sinMontos')::int = (d ->> 'compras')::int then 'Sin datos' else privado.usd((d ->> 'hotmart')::numeric) end)
    || format(fila, 'Comisión de afiliados', privado.usd((d ->> 'afiliados')::numeric))
    || format(fila, 'Impuestos', case when (d ->> 'configurado')::boolean then privado.usd(impuestos) else 'Sin datos' end)
    || format(fila, 'Inteligencia artificial', case when ia_sin_dato then 'Sin datos' else privado.usd((d ->> 'ia')::numeric) end)
    || format(fila, 'Servidores y correos (semana)', case when (d ->> 'configurado')::boolean then privado.usd((d ->> 'fijosSemana')::numeric) else 'Sin datos' end)
    || format(fila, 'Publicidad (semana)', privado.usd((d ->> 'publicidadSemana')::numeric))
    || format(fila, 'Clientes pagando', d ->> 'clientesPagando')
    || format(fila, 'Usuarios nuevos', d ->> 'nuevos')
    || format(fila, 'Usaron la app esta semana', d ->> 'activos')
    || format(fila, 'Usuarios en total', d ->> 'totalUsuarios')
    || format(fila, 'Usos de la IA', d ->> 'usosIa')
    || format(fila, 'Cancelaciones (decidieron irse)', d ->> 'voluntarias')
    || format(fila, 'Cancelaciones (falló el pago)', d ->> 'involuntarias')
    || format(fila, 'Reembolsos', d ->> 'reembolsos')
    || '</table>'
    || '<p style="margin:20px 0 0"><a href="https://app-mascota-navy.vercel.app/admin" style="background:#0f1b3d;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block">Abrir el panel</a></p>'
    || '<p style="color:#8a94ab;font-size:12px;margin-top:20px">Datos reales de la base de Kopeet. Servidores, correos y publicidad se reparten proporcionalmente a 7 días del mes.</p>'
    || '</div>';

  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || clave, 'Content-Type', 'application/json'),
    body := jsonb_build_object('from', 'Kopeet <onboarding@resend.dev>', 'to', to_jsonb(para), 'subject', asunto, 'html', cuerpo)
  ) into rid;

  insert into privado.envios_resumen (prueba, request_id, destinatarios) values (p_prueba, rid, para);
  return rid;
end; $$;

revoke all on function privado.usd(numeric) from public, anon, authenticated;
revoke all on function privado.resumen_semanal_datos() from public, anon, authenticated;
revoke all on function privado.enviar_resumen_semanal(boolean) from public, anon, authenticated;

-- ===== Acciones desde el panel (solo administradoras) =====
create or replace function public.admin_guardar_resend(p_valor text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  if p_valor is null or trim(p_valor) !~ '^re_[A-Za-z0-9_]{10,}$' then
    raise exception 'clave_invalida' using errcode = '22023';
  end if;
  insert into privado.secretos (clave, valor) values ('resend_api_key', trim(p_valor))
  on conflict (clave) do update set valor = excluded.valor, actualizado_en = now();
end; $$;

create or replace function public.admin_enviar_resumen_prueba()
returns bigint language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  return privado.enviar_resumen_semanal(true);
end; $$;

create or replace function public.admin_estado_resumen()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare e record; resp record;
begin
  perform public.exigir_admin();
  select * into e from privado.envios_resumen order by creado_en desc limit 1;
  if e.request_id is not null then
    select status_code, timed_out, error_msg, left(content, 300) as contenido into resp from net._http_response where id = e.request_id;
  end if;
  return jsonb_build_object(
    'claveGuardada', exists (select 1 from privado.secretos where clave = 'resend_api_key'),
    'programado', exists (select 1 from cron.job where jobname = 'kopeet-resumen-semanal' and active),
    'destinatarios', (select array_agg(email) from public.administradores),
    'ultimo', case when e.id is null then null else jsonb_build_object(
      'fecha', e.creado_en, 'prueba', e.prueba,
      'estado', case when resp.status_code between 200 and 299 then 'enviado'
                     when resp.status_code is not null or resp.timed_out or resp.error_msg is not null then 'error'
                     else 'pendiente' end,
      'codigo', resp.status_code,
      'detalle', coalesce(resp.error_msg, case when resp.status_code >= 300 then resp.contenido end)) end);
end; $$;

do $$
declare f text;
begin
  foreach f in array array['admin_guardar_resend(text)','admin_enviar_resumen_prueba()','admin_estado_resumen()'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- Todos los lunes a las 12:00 UTC (9:00 en Chile en horario de verano; 8:00 en invierno)
select cron.unschedule('kopeet-resumen-semanal') where exists (select 1 from cron.job where jobname = 'kopeet-resumen-semanal');
select cron.schedule('kopeet-resumen-semanal', '0 12 * * 1', 'select privado.enviar_resumen_semanal(false)');
