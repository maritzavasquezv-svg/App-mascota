-- "Boletas por emitir" (11 nov 2026): cada cobro aprobado por Hotmart necesita su boleta del SII.
-- La dueña la emite a mano en el SII y la marca como hecha en el panel.

alter table public.ventas add column if not exists boleta_emitida_en timestamptz;

-- Cobros (uno por transacción: el aviso PURCHASE_APPROVED) con su estado de boleta.
create or replace function public.admin_boletas() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  return jsonb_build_object(
    'pendientes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', v.id, 'fecha', v.fecha, 'email', v.email, 'plan', v.plan, 'moneda', v.moneda, 'monto', v.bruto,
        'transaccion', v.transaccion,
        'reembolsada', exists (select 1 from public.ventas x where x.transaccion = v.transaccion
                               and x.evento in ('PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST'))
      ) order by v.fecha)
      from public.ventas v
      where v.evento = 'PURCHASE_APPROVED' and v.boleta_emitida_en is null and coalesce(v.bruto, 1) > 0), '[]'::jsonb),  -- los cobros de $0 (inicio de la prueba gratis) no llevan boleta
    'hechas', coalesce((
      select jsonb_agg(h order by (h ->> 'emitida') desc) from (
        select jsonb_build_object('id', v.id, 'fecha', v.fecha, 'email', v.email, 'moneda', v.moneda, 'monto', v.bruto,
                                  'emitida', v.boleta_emitida_en) as h
        from public.ventas v
        where v.evento = 'PURCHASE_APPROVED' and v.boleta_emitida_en is not null
        order by v.boleta_emitida_en desc limit 10) z), '[]'::jsonb)
  );
end $$;

create or replace function public.admin_marcar_boleta(p_id uuid, p_hecha boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  update public.ventas set boleta_emitida_en = case when p_hecha then now() else null end
   where id = p_id and evento = 'PURCHASE_APPROVED';
end $$;

revoke all on function public.admin_boletas() from public, anon;
revoke all on function public.admin_marcar_boleta(uuid, boolean) from public, anon;
grant execute on function public.admin_boletas() to authenticated;
grant execute on function public.admin_marcar_boleta(uuid, boolean) to authenticated;
