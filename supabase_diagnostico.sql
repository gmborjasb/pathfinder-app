-- =============================================================================
-- PATHFINDER — Motor de Recomendación (v2 — Fix columnas + Reload Cache)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DIAGNÓSTICO: Ver todas las columnas de la tabla becas
-- Corre esto primero y anota el nombre exacto de la columna SISFOH
-- -----------------------------------------------------------------------------
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'becas'
ORDER BY ordinal_position;

