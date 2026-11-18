-- Cocina de Kopeet: datos del perro para calcular su plan de comida casera.
-- { peso_kg, actividad: baja|moderada|alta|muy_alta, castrado, contextura: delgado|ideal|sobrepeso,
--   alergias: [pollo|pavo|vacuno|cerdo|cordero|pescado|huevo|cereales|legumbres], enfermedad: bool }
alter table public.perros add column if not exists cocina jsonb;

alter table public.perros drop constraint if exists perros_cocina_valida;
alter table public.perros add constraint perros_cocina_valida check (
  cocina is null or (
    jsonb_typeof(cocina) = 'object'
    and pg_column_size(cocina) < 2000
    and (cocina->>'peso_kg') ~ '^[0-9]+(\.[0-9]+)?$'
    and (cocina->>'peso_kg')::numeric between 1 and 100
    and cocina->>'actividad' in ('baja','moderada','alta','muy_alta')
    and cocina->>'contextura' in ('delgado','ideal','sobrepeso')
    and jsonb_typeof(cocina->'castrado') = 'boolean'
    and jsonb_typeof(cocina->'enfermedad') = 'boolean'
    and jsonb_typeof(cocina->'alergias') = 'array'
  )
);

grant update (cocina) on public.perros to authenticated;

-- Cachorros: edad en meses y peso adulto esperado (opcionales).
alter table public.perros drop constraint if exists perros_cocina_cachorro;
alter table public.perros add constraint perros_cocina_cachorro check (
  cocina is null or (
    (cocina->'meses' is null or (jsonb_typeof(cocina->'meses') = 'number' and (cocina->>'meses')::numeric between 0 and 24))
    and (cocina->'peso_adulto_kg' is null or (jsonb_typeof(cocina->'peso_adulto_kg') = 'number' and (cocina->>'peso_adulto_kg')::numeric between 1 and 100))
  )
);
