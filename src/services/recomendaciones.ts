/**
 * recomendaciones.ts
 * Servicio para llamar a la función RPC de Supabase que calcula
 * la afinidad ponderada entre el perfil del usuario y cada beca.
 *
 * Pesos: Académico 40% | Socioeconómico 30% | Extracurricular 20% | Perfil 10%
 */

import { supabase } from '../lib/supabaseClient';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado que devuelve la función RPC `calcular_recomendaciones_becas` */
export interface BecaRecomendada {
  beca_id: string;
  titulo: string;
  sponsor: string;
  nivel: string;
  icono: string;
  cobertura: string;
  requisitos: string;
  sobre: string;
  beneficios: string[];
  fecha_cierre: string | null;
  documentos_requeridos: Record<string, unknown> | null;
  afinidad_calculada: number;
  // Criterios de la beca para el cruce de requisitos
  req_nota_minima: number | null;
  req_sisfoh: string | null;
  req_merito: string | null;
  req_tipo_colegio: string | null;
  requiere_mujeres: boolean;
  prioriza_voluntariado: boolean;
  prioriza_deportista: boolean;
}

/** Resultado de un SELECT simple a la tabla becas (fallback sin sesión) */
export interface BecaRaw {
  id: string;
  titulo: string;
  sponsor: string;
  nivel: string;
  icono: string | null;
  cobertura: string;
  requisitos: string;
  fecha_cierre: string | null;
  sobre: string;
  beneficios: string[] | null;
  documentos_requeridos: Record<string, unknown> | null;
  afinidad: number | null;
}

// ---------------------------------------------------------------------------
// Funciones
// ---------------------------------------------------------------------------

/**
 * Invoca la RPC de scoring ponderado en Supabase.
 * Solo llama a esta función cuando hay un usuario autenticado.
 *
 * @param usuarioId UUID del usuario autenticado (de `useAuth().user.id`)
 * @returns Array de becas ordenadas de mayor a menor afinidad calculada
 */
export async function getBecasRecomendadas(
  usuarioId: string
): Promise<BecaRecomendada[]> {
  const { data, error } = await supabase.rpc(
    'calcular_recomendaciones_becas',
    { id_usuario_param: usuarioId }
  );

  if (error) {
    // Errores comunes y su causa:
    // "Could not find the function" → El caché de PostgREST no se actualizó aún.
    //   Solución: Ejecutar NOTIFY pgrst, 'reload schema'; en Supabase SQL Editor.
    // "column b.X does not exist" → La función usa un nombre de columna incorrecto.
    //   Solución: Re-ejecutar supabase_recommendation_rpc.sql con el nombre correcto.
    console.error('[Recomendaciones] Error en RPC:', error.message);
    if (error.message?.includes('schema cache')) {
      console.warn('[Recomendaciones] Caché no actualizado. Ejecuta: NOTIFY pgrst, \'reload schema\'; en Supabase SQL Editor.');
    }
    if (error.message?.includes('does not exist')) {
      console.warn('[Recomendaciones] Columna inexistente en la función. Re-ejecuta supabase_recommendation_rpc.sql con el nombre correcto.');
    }
    throw error;
  }

  return (data ?? []) as BecaRecomendada[];
}

/**
 * Obtiene becas desde la tabla directamente (sin scoring personalizado).
 * Se usa como fallback cuando el usuario no está autenticado.
 *
 * @returns Array de becas con afinidad neutra (valor del campo `afinidad` en BD)
 */
export async function getBecasFallback(): Promise<BecaRaw[]> {
  const { data, error } = await supabase
    .from('becas')
    .select(
      'id, titulo, sponsor, nivel, icono, cobertura, requisitos, fecha_cierre, sobre, beneficios, documentos_requeridos, afinidad'
    )
    .order('id', { ascending: true });

  if (error) {
    console.error('[Recomendaciones] Error en fallback:', error.message);
    throw error;
  }

  return (data ?? []) as BecaRaw[];
}
