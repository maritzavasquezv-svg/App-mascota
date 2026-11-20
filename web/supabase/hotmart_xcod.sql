-- H1 (auditoría 20 nov 2026): el pago se reconoce aunque la persona escriba en Hotmart un correo distinto al de su cuenta.
-- La app abre Hotmart con ?xcod=<id de la cuenta>; Hotmart lo devuelve en data.purchase.origin.xcod.
-- Con eso se busca el correo de la cuenta y se guarda la equivalencia (correo de Hotmart → correo de la cuenta),
-- para que las renovaciones, cancelaciones y reembolsos posteriores (que pueden venir sin xcod) también lleguen a la cuenta correcta.

create table if not exists privado.correos_hotmart (
  email_hotmart text primary key,
  email_cuenta text not null,
  creado_en timestamptz not null default now()
);
revoke all on privado.correos_hotmart from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.hotmart_recibir(p_hottok text, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  esperado text := (select valor from privado.secretos where clave = 'hotmart_hottok');
  ev text := coalesce(p_payload ->> 'event', '');
  correo text := lower(trim(coalesce(p_payload #>> '{data,buyer,email}', p_payload #>> '{data,subscriber,email}')));
  trx text := p_payload #>> '{data,purchase,transaction}';
  nombre_plan text := lower(coalesce(p_payload #>> '{data,subscription,plan,name}', p_payload #>> '{data,product,name}', ''));
  com jsonb := coalesce(p_payload #> '{data,commissions}', '[]'::jsonb);
  momento timestamptz := privado.fecha_hotmart(p_payload ->> 'creation_date');
  xcod text := trim(coalesce(p_payload #>> '{data,purchase,origin,xcod}', ''));
  cuenta text;
  previo public.suscripciones%rowtype;
  fin timestamptz;
  c_hotmart numeric; c_afiliado numeric; c_productor numeric; bruto numeric; moneda text;
  estado text; baja text; plan text;
  fallos_hora int;
begin
  if esperado is null or p_hottok is null or p_hottok <> esperado then
    select count(*) into fallos_hora from public.avisos_hotmart where not ok and recibido_en > now() - interval '1 hour';
    if fallos_hora < 30 then
      insert into public.avisos_hotmart (evento, ok, detalle)
      values (left(ev, 60), false, case when esperado is null then 'Falta guardar el hottok en el panel' else 'Hottok incorrecto' end);
    end if;
    return jsonb_build_object('ok', false, 'motivo', case when esperado is null then 'sin_configurar' else 'hottok' end);
  end if;

  -- Correo de la cuenta: primero por el identificador que manda la app (xcod), después por una equivalencia ya guardada.
  if xcod ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select lower(u.email) into cuenta from auth.users u where u.id = xcod::uuid;
  end if;
  if cuenta is null and coalesce(correo, '') <> '' then
    select c.email_cuenta into cuenta from privado.correos_hotmart c where c.email_hotmart = correo;
  end if;
  if cuenta is not null and coalesce(correo, '') <> '' and cuenta <> correo then
    insert into privado.correos_hotmart (email_hotmart, email_cuenta) values (correo, cuenta)
    on conflict (email_hotmart) do update set email_cuenta = excluded.email_cuenta;
  end if;
  correo := coalesce(cuenta, correo);

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
  if plan is not null and (nombre_plan like '%famil%') then plan := 'familiar_' || plan; end if;

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

  insert into public.ventas (transaccion, evento, email, plan, moneda, bruto, comision_hotmart, comision_afiliado, neto, afiliado, recurrencia, tipo_baja, payload)
  values (trx, ev, correo, plan, moneda, bruto, c_hotmart, coalesce(c_afiliado, case when c_productor is not null then 0 end), c_productor,
          p_payload #>> '{data,affiliates,0,name}', nullif(p_payload #>> '{data,purchase,recurrence_number}', '')::integer, baja, p_payload)
  on conflict (transaccion, evento) where transaccion is not null do nothing;

  select * into previo from public.suscripciones s where s.email = correo;

  if previo.evento_en is not null and momento is not null and momento < previo.evento_en then
    insert into public.avisos_hotmart (evento, ok, detalle) values (ev, true, 'Aviso antiguo: guardado en ventas, sin cambiar el acceso');
    return jsonb_build_object('ok', true, 'ignorado', 'antiguo');
  end if;
  if previo.estado = 'reembolsada' and estado = 'activa' and trx is not null and previo.hotmart_transaccion = trx then
    insert into public.avisos_hotmart (evento, ok, detalle) values (ev, true, 'Compra ya reembolsada: no se reactiva');
    return jsonb_build_object('ok', true, 'ignorado', 'reembolsada');
  end if;

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
      estado := 'activa';
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
end $function$;
