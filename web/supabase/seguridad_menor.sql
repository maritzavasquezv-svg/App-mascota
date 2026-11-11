-- Arreglos de seguridad recomendados en la auditoría (11 nov 2026).

-- 1) Registros de salud: al editar, el perro también tiene que ser de la persona.
drop policy if exists "eventos propios: editar" on public.eventos_salud;
create policy "eventos propios: editar" on public.eventos_salud for update
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id
              and exists (select 1 from public.perros p where p.id = eventos_salud.perro_id and p.usuario_id = (select auth.uid())));

-- 2) Métricas del panel: además del tope por sesión, un tope general de 3.000 eventos por hora
--    (nadie puede inflar las métricas inventando sesiones).
create or replace function public.registrar_evento(p_nombre text, p_sesion text default null, p_props jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare s text := left(coalesce(p_sesion, ''), 64);
begin
  if p_nombre not in ('pagina_ventas','onboarding_paso','plan_visto','plan_elegido','cuenta_creada','app_abierta',
                      'perro_creado','rutina','consejero','escaner','premios_vistos','destino_abierto','emergencia_abierta') then
    return;
  end if;
  if p_props is null or jsonb_typeof(p_props) <> 'object' or length(p_props::text) > 500 then p_props := '{}'::jsonb; end if;
  -- freno contra abuso: máximo 300 eventos por sesión al día
  if s <> '' and (select count(*) from public.eventos e where e.sesion = s and e.creado_en > now() - interval '1 day') >= 300 then
    return;
  end if;
  -- freno general: máximo 3.000 eventos por hora en total
  if (select count(*) from public.eventos e where e.creado_en > now() - interval '1 hour') >= 3000 then
    return;
  end if;
  insert into public.eventos (usuario_id, sesion, nombre, props) values (auth.uid(), nullif(s, ''), p_nombre, p_props);
end; $$;
