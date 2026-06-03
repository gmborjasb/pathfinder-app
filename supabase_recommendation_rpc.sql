-- =============================================================================
-- PATHFINDER — Motor de Recomendación v3
-- NUEVO: Retorna los 7 campos de criterios para el Cruce de Requisitos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================================

-- Eliminar versiones anteriores
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT oid::regprocedure AS func_sig FROM pg_proc
    WHERE proname = 'calcular_recomendaciones_becas' AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE';
  END LOOP;
END $$;

-- Crear función v3 con criterios incluidos en el RETURNS
CREATE FUNCTION public.calcular_recomendaciones_becas(id_usuario_param UUID)
RETURNS TABLE (
  beca_id               VARCHAR,
  titulo                VARCHAR,
  sponsor               VARCHAR,
  nivel                 VARCHAR,
  icono                 VARCHAR,
  cobertura             TEXT,
  requisitos            TEXT,
  sobre                 TEXT,
  beneficios            JSONB,
  fecha_cierre          DATE,
  documentos_requeridos JSONB,
  afinidad_calculada    INT,
  -- Campos de criterios para el cruce de requisitos en el frontend
  req_nota_minima       NUMERIC,
  req_sisfoh            VARCHAR,
  req_merito            VARCHAR,
  req_tipo_colegio      VARCHAR,
  requiere_mujeres      BOOLEAN,
  prioriza_voluntariado BOOLEAN,
  prioriza_deportista   BOOLEAN
) AS $$
DECLARE
  u_nota         NUMERIC(4,2);
  u_sisfoh       VARCHAR;
  u_colegio      VARCHAR;
  u_genero       VARCHAR;
  u_voluntariado BOOLEAN;
  u_deportista   BOOLEAN;
  u_merito       VARCHAR;
BEGIN
  SELECT
    COALESCE((perfil_detalles->'notas'->>'gpa')::NUMERIC, 11.00),
    COALESCE(perfil_detalles->>'sisfoh',       'No Pobre'),
    COALESCE(perfil_detalles->>'tipo_colegio', 'Particular'),
    COALESCE(genero,            'Masculino'),
    COALESCE(hace_voluntariado, false),
    COALESCE(es_deportista,     false),
    COALESCE(merito_academico,  'ninguno')
  INTO u_nota, u_sisfoh, u_colegio, u_genero, u_voluntariado, u_deportista, u_merito
  FROM public.usuarios WHERE id = id_usuario_param;

  RETURN QUERY
  SELECT
    b.id, b.titulo, b.sponsor, b.nivel, b.icono,
    b.cobertura, b.requisitos, b.sobre, b.beneficios,
    b.fecha_cierre, b.documentos_requeridos,

    -- Score de afinidad
    CASE
      WHEN b.requiere_mujeres = true AND u_genero <> 'Femenino' THEN 0
      WHEN b.req_tipo_colegio <> 'Cualquiera' AND b.req_tipo_colegio <> u_colegio THEN 0
      WHEN b.req_sisfoh = 'Pobreza Extrema' AND u_sisfoh <> 'Pobreza Extrema' THEN 0
      ELSE LEAST(100, (
        CASE
          WHEN u_nota >= COALESCE(b.req_nota_minima, 11.0) AND u_merito IN ('quinto','tercio') THEN 40
          WHEN u_nota >= COALESCE(b.req_nota_minima, 11.0) THEN 34
          WHEN u_nota >= (COALESCE(b.req_nota_minima, 11.0) - 1.5) THEN 22
          ELSE 10
        END +
        CASE
          WHEN b.req_sisfoh IS NULL OR b.req_sisfoh = 'Cualquiera' THEN 20
          WHEN b.req_sisfoh = u_sisfoh THEN 30
          WHEN b.req_sisfoh = 'Pobre' AND u_sisfoh IN ('Pobre','Pobreza Extrema') THEN 25
          ELSE 5
        END +
        CASE
          WHEN b.prioriza_voluntariado = true AND u_voluntariado = true THEN 12
          WHEN b.prioriza_deportista   = true AND u_deportista   = true THEN 12
          WHEN b.prioriza_voluntariado = true AND u_voluntariado = false THEN 4
          WHEN b.prioriza_deportista   = true AND u_deportista   = false THEN 4
          ELSE 15
        END +
        CASE
          WHEN b.req_tipo_colegio IS NULL OR b.req_tipo_colegio = 'Cualquiera' THEN 8
          WHEN b.req_tipo_colegio = u_colegio THEN 10
          ELSE 4
        END
      ))
    END::INT AS afinidad_calculada,

    -- Criterios de la beca (para el cruce de requisitos en el frontend)
    b.req_nota_minima,
    b.req_sisfoh,
    b.req_merito,
    b.req_tipo_colegio,
    b.requiere_mujeres,
    b.prioriza_voluntariado,
    b.prioriza_deportista

  FROM public.becas b
  ORDER BY afinidad_calculada DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.calcular_recomendaciones_becas(UUID) TO authenticated;
NOTIFY pgrst, 'reload schema';
