-- Seguridad de los avisos de Hotmart (auditoría 11 nov 2026)
-- 1) Al cancelar la suscripción, se mantiene el acceso hasta el fin del período pagado (lo prometen los Términos).
-- 2) Un aviso más antiguo nunca reemplaza a uno más nuevo (Hotmart reenvía avisos y pueden llegar desordenados),
--    y una compra reembolsada no se reactiva con un aviso repetido de esa misma compra.
-- 3) Los intentos con hottok falso se guardan con tope (máx. 30 por hora), para que nadie llene la base ni dispare alertas falsas.

alter table public.suscripciones add column if not exists evento_en timestamptz;

-- Convierte las fechas de Hotmart (milisegundos, segundos o texto ISO) a fecha. Nunca falla: devuelve null.
create or replace function privado.fecha_hotmart(x text) returns timestamptz
language plpgsql immutable set search_path = '' as $$
begin
  if x is null or x = '' then return null; end if;
  if x ~ '^\d{12,14}$' then return to_timestamp(x::numeric / 1000); end if;
  if x ~ '^\d{9,11}$' then return to_timestamp(x::numeric); end if;
  return x::timestamptz;
exception when others then return null;
end $$;

create or replace function public.hotmart_recibir(p_hottok text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  esperado text := (select valor from privado.secretos where clave = 'hotmart_hottok');
  ev text := coalesce(p_payload ->> 'event', '');
  correo text := lower(trim(p_payload #>> '{data,buyer,email}'));
  trx text := p_payload #>> '{data,purchase,transaction}';
  nombre_plan text := lower(coalesce(p_payload #>> '{data,subscription,plan,name}', p_payload #>> '{data,product,name}', ''));
  com jsonb := coalesce(p_payload #> '{data,commissions}', '[]'::jsonb);
  momento timestamptz := privado.fecha_hotmart(p_payload ->> 'creation_date');
  previo public.suscripciones%rowtype;
  fin timestamptz;
  c_hotmart numeric; c_afiliado numeric; c_productor numeric; bruto numeric; moneda text;
  estado text; baja text; plan text;
  fallos_hora int;
begin
  if esperado is null or p_hottok is null or p_hottok <> esperado then
    -- Tope: así un ataque no llena la tabla ni hace parecer que Hotmart falla.
    select count(*) into fallos_hora from public.avisos_hotmart where not ok and recibido_en > now() - interval '1 hour';
    if fallos_hora < 30 then
      insert into public.avisos_hotmart (evento, ok, detalle)
      values (left(ev, 60), false, case when esperado is null then 'Falta guardar el hottok en el panel' else 'Hottok incorrecto' end);
    end if;
    return jsonb_build_object('ok', false, 'motivo', case when esperado is null then 'sin_configurar' else 'hottok' end);
  end if;

  estado := case ev
    when 'PURCHASE_APPROVED' then 'activa' when 'PURCHASE_COMPLETE' then 'activa'
    when 'PURCHASE_REFUNDED' then 'reembolsada' when 'PURCHASE_CHARGEBACK' then 'reembolsada' when 'PURCHASE_PROTEST' then 'reembolsada'
    when 'PURCHASE_CANCELED' then 'cancelada' when 'SUBSCRIPTION_CANCELLATION' then 'cancelada'
    when 'PURCHASE_EXPIRED' then 'vencida' when 'PURCHASE_DELAYED' then 'vencida'
    else null end;
  baja := case ev
    when 'SUBSCRIPTION_CANCELLATION' then 'voluntaria'
    when 'PURCHASE_CANCELED' then 'involuntaria' when 'PURCHASE_EXPIRED' then 'involuntaria' when 'PURCHASE_DELAYED' then 'involuntaria'
    when 'PURCHASE_REFUNDED' then 'reembolso' when 'PURCHASE_CHARGEBACK' then 'reembolso' when 'PURCHASE_PROTEST' then 'reembolso'
    else null end;

  if estado is null or correo is null or correo = '' then
    insert into public.avisos_hotmart (evento, ok, detalle) values (ev, true, 'Evento sin efecto en la app');
    return jsonb_build_object('ok', true, 'ignorado', ev);
  end if;

  plan := case
    when nombre_plan like '%anual%' or nombre_plan like '%annual%' or nombre_plan like '%year%' then 'anual'
    when nombre_plan like '%mensual%' or nombre_plan like '%month%' then 'mensual'
    else null end;
  -- Plan familiar (hasta 4 perros): el nombre del plan en Hotmart debe incluir "familiar"
  if plan is not null and (nombre_plan like '%famil%') then plan := 'familiar_' || plan; end if;

  -- Montos: lo que cobra Hotmart (MARKETPLACE), el afiliado (AFFILIATE) y lo que recibe la productora (PRODUCER)
  select sum((c ->> 'value')::numeric) filter (where c ->> 'source' = 'MARKETPLACE'),
         sum((c ->> 'value')::numeric) filter (where c ->> 'source' in ('AFFILIATE')),
         sum((c ->> 'value')::numeric) filter (where c ->> 'source' in ('PRODUCER','COPRODUCER')),
         max(c ->> 'currency_value')
    into c_hotmart, c_afiliado, c_productor, moneda
    from jsonb_array_elements(case when jsonb_typeof(com) = 'array' then com else '[]'::jsonb end) c;
  if c_productor is not null then
    bruto := coalesce(c_productor, 0) + coalesce(c_hotmart, 0) + coalesce(c_afiliado, 0);
  else
    bruto := nullif(p_payload #>> '{data,purchase,price,value}', '')::numeric;
    moneda := p_payload #>> '{data,purchase,price,currency_value}';
  end if;

  -- El historial de ventas siempre se guarda (una sola vez por transacción y evento).
  insert into public.ventas (transaccion, evento, email, plan, moneda, bruto, comision_hotmart, comision_afiliado, neto, afiliado, recurrencia, tipo_baja, payload)
  values (trx, ev, correo, plan, moneda, bruto, c_hotmart, coalesce(c_afiliado, case when c_productor is not null then 0 end), c_productor,
          p_payload #>> '{data,affiliates,0,name}', nullif(p_payload #>> '{data,purchase,recurrence_number}', '')::integer, baja, p_payload)
  on conflict (transaccion, evento) where transaccion is not null do nothing;

  select * into previo from public.suscripciones s where s.email = correo;

  -- Aviso desordenado: si es más antiguo que el último aplicado, no cambia el acceso.
  if previo.evento_en is not null and momento is not null and momento < previo.evento_en then
    insert into public.avisos_hotmart (evento, ok, detalle) values (ev, true, 'Aviso antiguo: guardado en ventas, sin cambiar el acceso');
    return jsonb_build_object('ok', true, 'ignorado', 'antiguo');
  end if;
  -- Una compra reembolsada no se reactiva con un aviso repetido de esa misma compra.
  if previo.estado = 'reembolsada' and estado = 'activa' and trx is not null and previo.hotmart_transaccion = trx then
    insert into public.avisos_hotmart (evento, ok, detalle) values (ev, true, 'Compra ya reembolsada: no se reactiva');
    return jsonb_build_object('ok', true, 'ignorado', 'reembolsada');
  end if;

  -- Cancelación voluntaria: el acceso sigue hasta el fin del período pagado.
  if ev = 'SUBSCRIPTION_CANCELLATION' then
    fin := coalesce(privado.fecha_hotmart(p_payload #>> '{data,date_next_charge}'),
                    privado.fecha_hotmart(p_payload #>> '{data,subscription,date_next_charge}'),
                    privado.fecha_hotmart(p_payload #>> '{data,purchase,date_next_charge}'));
    if fin is null then
      select v.fecha + case when coalesce(plan, previo.plan, v.plan, '') like '%anual' then interval '1 year' else interval '1 month' end
        into fin
        from public.ventas v
       where lower(v.email) = correo and v.evento in ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE')
       order by v.fecha desc limit 1;
    end if;
    if fin is not null and fin > now() then
      estado := 'activa';           -- con fecha de término: la app lo corta sola ese día
    else
      fin := null;
    end if;
  end if;

  insert into public.suscripciones (email, estado, plan, hotmart_transaccion, ultimo_evento, actualizado_en, origen, vence_en, evento_en)
  values (correo, estado, plan, trx, ev, now(), 'hotmart', fin, coalesce(momento, now()))
  on conflict (email) do update set
    estado = excluded.estado,
    plan = coalesce(excluded.plan, public.suscripciones.plan),
    hotmart_transaccion = coalesce(excluded.hotmart_transaccion, public.suscripciones.hotmart_transaccion),
    ultimo_evento = excluded.ultimo_evento,
    actualizado_en = now(),
    origen = 'hotmart',
    vence_en = excluded.vence_en,
    evento_en = excluded.evento_en;

  insert into public.avisos_hotmart (evento, ok, detalle)
  values (ev, true, case when fin is not null then 'Cancelada: acceso hasta ' || to_char(fin at time zone 'America/Santiago', 'DD-MM-YYYY') else 'Guardado' end);
  return jsonb_build_object('ok', true);
end $$;
