-- Función de lectura del panel de administración (copia de lo aplicado en Supabase).
-- Solo responde a administradoras (exigir_admin). Devuelve números crudos; las cuentas finales
-- (ganancia, margen, LTV, CAC, avisos) se hacen en web/lib/panel.ts.
create or replace function public.admin_panel(p_mes date default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  ini timestamptz := date_trunc('month', coalesce(p_mes, now()::date)::timestamptz);
  fin timestamptz := ini + interval '1 month';
  ini_ant timestamptz := ini - interval '1 month';
  r jsonb;
begin
  perform public.exigir_admin();

  with
  reemb as (select distinct transaccion from public.ventas where tipo_baja = 'reembolso' and transaccion is not null),
  aprob as (select v.*, (v.transaccion in (select transaccion from reemb)) as reembolsada
            from public.ventas v where v.evento = 'PURCHASE_APPROVED'),
  act as (
    select usuario_id as u, creado_en::date as d from public.eventos where usuario_id is not null
    union select usuario_id, creado_en::date from public.registros
    union select usuario_id, creado_en::date from public.usos_ia
    union select id, last_sign_in_at::date from auth.users where last_sign_in_at is not null
  ),
  usu as (
    select u.id, lower(u.email) as email, u.created_at, u.created_at::date as c, u.last_sign_in_at, u.email_confirmed_at,
           coalesce(nullif(p.origen, ''), 'directo') as origen, p.nombre
    from auth.users u left join public.perfiles p on p.id = u.id
  ),
  pagos as (
    select lower(email) as email, sum(coalesce(neto, bruto)) as neto, sum(bruto) as bruto, count(*) as compras
    from aprob where not reembolsada group by lower(email)
  ),
  canal_cliente as (
    select pg.*, coalesce(us.origen, case when exists (select 1 from aprob a where lower(a.email) = pg.email and a.afiliado is not null)
                                          then 'afiliado' else 'sin cuenta' end) as canal
    from pagos pg left join usu us on us.email = pg.email
  )
  select jsonb_build_object(
    'mes', to_char(ini, 'YYYY-MM-DD'),
    'generado', now(),
    'ventas', jsonb_build_object(
      'actual', (select jsonb_build_object(
          'compras', count(*) filter (where not reembolsada),
          'bruto', coalesce(sum(bruto) filter (where not reembolsada), 0),
          'hotmart', coalesce(sum(comision_hotmart) filter (where not reembolsada), 0),
          'afiliados', coalesce(sum(comision_afiliado) filter (where not reembolsada), 0),
          'sinMontos', count(*) filter (where not reembolsada and comision_hotmart is null),
          'nuevas', count(*) filter (where not reembolsada and coalesce(recurrencia, 1) <= 1),
          'renovaciones', count(*) filter (where not reembolsada and recurrencia > 1),
          'monedas', coalesce(jsonb_agg(distinct moneda) filter (where moneda is not null), '[]'::jsonb))
        from aprob where fecha >= ini and fecha < fin),
      'anterior', (select jsonb_build_object('compras', count(*) filter (where not reembolsada),
          'bruto', coalesce(sum(bruto) filter (where not reembolsada), 0),
          'hotmart', coalesce(sum(comision_hotmart) filter (where not reembolsada), 0),
          'afiliados', coalesce(sum(comision_afiliado) filter (where not reembolsada), 0))
        from aprob where fecha >= ini_ant and fecha < ini),
      'bajas', (select jsonb_build_object(
          'voluntarias', count(*) filter (where tipo_baja = 'voluntaria'),
          'involuntarias', count(*) filter (where tipo_baja = 'involuntaria'),
          'reembolsos', count(*) filter (where tipo_baja = 'reembolso'),
          'montoReembolsado', coalesce((select sum(a.bruto) from aprob a where a.transaccion in
              (select transaccion from public.ventas where tipo_baja = 'reembolso' and fecha >= ini and fecha < fin)), 0))
        from public.ventas where fecha >= ini and fecha < fin),
      'porMes', coalesce((select jsonb_agg(x order by x->>'mes') from (
          select jsonb_build_object('mes', to_char(m, 'YYYY-MM'),
            'bruto', coalesce((select sum(bruto) from aprob where not reembolsada and fecha >= m and fecha < m + interval '1 month'), 0),
            'neto', coalesce((select sum(coalesce(neto, bruto)) from aprob where not reembolsada and fecha >= m and fecha < m + interval '1 month'), 0)) as x
          from generate_series(ini - interval '11 months', ini, interval '1 month') m) t), '[]'::jsonb),
      'activas', (select jsonb_build_object(
          'pagadas', count(*) filter (where s.origen = 'hotmart'),
          'manuales', count(*) filter (where s.origen = 'manual' and (s.vence_en is null or s.vence_en > now())),
          'mrr', coalesce(sum(case when s.origen = 'hotmart' then
                   (select case when coalesce(v.plan, s.plan) = 'anual' then v.bruto / 12 else v.bruto end
                      from aprob v where lower(v.email) = lower(s.email) and not v.reembolsada order by v.fecha desc limit 1) end), 0),
          'mrrSinMonto', count(*) filter (where s.origen = 'hotmart' and not exists (select 1 from aprob v where lower(v.email) = lower(s.email))))
        from public.suscripciones s where s.estado = 'activa')
    ),
    'ia', jsonb_build_object(
      'mes', coalesce((select sum(costo_usd) from public.usos_ia where creado_en >= ini and creado_en < fin), 0),
      'hoy', coalesce((select sum(costo_usd) from public.usos_ia where creado_en >= date_trunc('day', now())), 0),
      'usosMes', (select count(*) from public.usos_ia where creado_en >= ini and creado_en < fin),
      'usosSinCosto', (select count(*) from public.usos_ia where creado_en >= ini and creado_en < fin and costo_usd is null),
      'porFuncion', coalesce((select jsonb_agg(jsonb_build_object('funcion', tipo, 'usos', n, 'costo', c) order by c desc nulls last)
          from (select tipo, count(*) as n, sum(costo_usd) as c from public.usos_ia where creado_en >= ini and creado_en < fin group by tipo) t), '[]'::jsonb),
      'porUsuario', coalesce((select jsonb_agg(jsonb_build_object('email', email, 'usos', n, 'costo', c) order by c desc nulls last)
          from (select us.email, count(*) as n, sum(i.costo_usd) as c from public.usos_ia i join usu us on us.id = i.usuario_id
                where i.creado_en >= ini and i.creado_en < fin group by us.email order by sum(i.costo_usd) desc nulls last limit 10) t), '[]'::jsonb),
      'porDia', coalesce((select jsonb_agg(jsonb_build_object('dia', to_char(d, 'YYYY-MM-DD'),
            'costo', coalesce((select sum(costo_usd) from public.usos_ia where creado_en::date = d::date), 0)) order by d)
          from generate_series(ini, least(fin - interval '1 day', now()), interval '1 day') d), '[]'::jsonb)
    ),
    'usuarios', jsonb_build_object(
      'total', (select count(*) from usu),
      'confirmados', (select count(*) from usu where email_confirmed_at is not null),
      'nuevosMes', (select count(*) from usu where created_at >= ini and created_at < fin),
      'nuevosAnterior', (select count(*) from usu where created_at >= ini_ant and created_at < ini),
      'activos7', (select count(distinct u) from act where d >= current_date - 6),
      'activos30', (select count(distinct u) from act where d >= current_date - 29),
      'activacion', (select jsonb_build_object('base', count(*), 'activados', count(*) filter (where
            exists (select 1 from public.perros p where p.usuario_id = us.id)
            and (exists (select 1 from public.registros g where g.usuario_id = us.id and g.creado_en < us.created_at + interval '7 days')
              or exists (select 1 from public.usos_ia i where i.usuario_id = us.id and i.creado_en < us.created_at + interval '7 days')
              or exists (select 1 from public.eventos e where e.usuario_id = us.id and e.nombre in ('rutina','consejero','escaner')
                         and e.creado_en < us.created_at + interval '7 days'))))
          from usu us),
      'retencion', (select jsonb_agg(jsonb_build_object('dia', n,
            'base', (select count(*) from usu where c <= current_date - n),
            'volvieron', (select count(*) from usu where c <= current_date - n
                          and exists (select 1 from act a where a.u = usu.id and a.d >= usu.c + n))))
          from unnest(array[1, 7, 30]) n)
    ),
    'uso', jsonb_build_object(
      'eventos', coalesce((select jsonb_object_agg(nombre, n) from (select nombre, count(*) as n from public.eventos
          where creado_en >= ini and creado_en < fin group by nombre) t), '{}'::jsonb),
      'personasPorAccion', coalesce((select jsonb_object_agg(nombre, n) from (select nombre, count(distinct coalesce(usuario_id::text, sesion)) as n
          from public.eventos where creado_en >= ini and creado_en < fin group by nombre) t), '{}'::jsonb),
      'embudo', coalesce((select jsonb_agg(jsonb_build_object('paso', p, 'sesiones', (select count(distinct sesion) from public.eventos
            where nombre = 'onboarding_paso' and (props ->> 'paso') = p::text and creado_en >= ini and creado_en < fin)) order by p)
          from generate_series(1, 8) p), '[]'::jsonb),
      'visitas', (select count(distinct sesion) from public.eventos where nombre = 'pagina_ventas' and creado_en >= ini and creado_en < fin),
      'vieronPlanes', (select count(distinct sesion) from public.eventos where nombre = 'plan_visto' and creado_en >= ini and creado_en < fin),
      'eligieronPlan', (select count(distinct sesion) from public.eventos where nombre = 'plan_elegido' and creado_en >= ini and creado_en < fin),
      'cuentas', (select count(*) from public.eventos where nombre = 'cuenta_creada' and creado_en >= ini and creado_en < fin),
      'desde', (select min(creado_en) from public.eventos),
      'rutinaPorTipo', coalesce((select jsonb_object_agg(tipo, n) from (select tipo, count(*) as n from public.registros
          where creado_en >= ini and creado_en < fin group by tipo) t), '{}'::jsonb)
    ),
    'canales', coalesce((select jsonb_agg(x order by (x->>'usuarios')::int desc) from (
        select jsonb_build_object('canal', k.canal,
          'usuarios', (select count(*) from usu where origen = k.canal),
          'usuariosMes', (select count(*) from usu where origen = k.canal and created_at >= ini and created_at < fin),
          'clientes', (select count(*) from canal_cliente where canal = k.canal),
          'netoTotal', coalesce((select sum(neto) from canal_cliente where canal = k.canal), 0),
          'gastoTotal', coalesce((select sum(monto_usd) from public.gastos_publicidad where canal = k.canal), 0),
          'gastoMes', coalesce((select sum(monto_usd) from public.gastos_publicidad where canal = k.canal and mes = ini::date), 0),
          'mesesConVentas', (select count(distinct date_trunc('month', a.fecha)) from aprob a join canal_cliente cc on cc.email = lower(a.email)
                             where cc.canal = k.canal and not a.reembolsada)) as x
        from (select origen as canal from usu union select canal from canal_cliente union select canal from public.gastos_publicidad) k) t), '[]'::jsonb),
    'costos', (select jsonb_build_object('impuestoPct', impuesto_pct, 'infra', infra_usd_mes, 'email', email_usd_mes, 'configurado', configurado,
          'publicidadMes', coalesce((select sum(monto_usd) from public.gastos_publicidad where mes = ini::date), 0))
        from public.ajustes_negocio where id = 1),
    'gastos', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'mes', to_char(mes, 'YYYY-MM'), 'canal', canal, 'monto', monto_usd) order by mes desc, canal)
        from public.gastos_publicidad), '[]'::jsonb),
    'salud', jsonb_build_object(
      'hottokGuardado', exists (select 1 from privado.secretos where clave = 'hotmart_hottok'),
      'ultimoAviso', (select jsonb_build_object('fecha', recibido_en, 'ok', ok, 'evento', evento, 'detalle', detalle)
          from public.avisos_hotmart order by recibido_en desc limit 1),
      'ultimoAvisoOk', (select max(recibido_en) from public.avisos_hotmart where ok),
      'fallos7', (select count(*) from public.avisos_hotmart where not ok and recibido_en > now() - interval '7 days'),
      'avisos7', (select count(*) from public.avisos_hotmart where recibido_en > now() - interval '7 days'),
      'erroresAbiertos', (select count(*) from public.errores where not resuelto),
      'errores24', (select count(*) from public.errores where creado_en > now() - interval '1 day'),
      'errores', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'origen', origen, 'mensaje', mensaje, 'fecha', creado_en, 'resuelto', resuelto) order by creado_en desc)
          from (select * from public.errores order by creado_en desc limit 30) e), '[]'::jsonb)
    ),
    'personas', coalesce((select jsonb_agg(x order by x->>'creado' desc nulls last) from (
        select jsonb_build_object(
          'email', k.email,
          'nombre', coalesce(us.nombre, am.nombre),
          'tieneCuenta', us.id is not null,
          'creado', coalesce(us.created_at, am.creado_en),
          'confirmado', us.email_confirmed_at is not null,
          'ultimoIngreso', us.last_sign_in_at,
          'origen', us.origen,
          'estado', coalesce(s.estado, 'sin plan'),
          'plan', s.plan,
          'tipoAcceso', s.origen,
          'vence', s.vence_en,
          'manual', am.motivo,
          'ultimoEnvio', am.ultimo_envio,
          'perros', (select count(*) from public.perros p where p.usuario_id = us.id),
          'pagado', coalesce((select pagos.neto from pagos where pagos.email = k.email), 0),
          'costoIa', coalesce((select sum(costo_usd) from public.usos_ia i where i.usuario_id = us.id), 0)) as x
        from (select email from usu union select email from public.accesos_manuales union select lower(email) from public.suscripciones) k
        left join usu us on us.email = k.email
        left join public.accesos_manuales am on am.email = k.email
        left join public.suscripciones s on lower(s.email) = k.email) t), '[]'::jsonb)
  ) into r;
  return r;
end; $$;
revoke all on function public.admin_panel(date) from public, anon;
grant execute on function public.admin_panel(date) to authenticated;
