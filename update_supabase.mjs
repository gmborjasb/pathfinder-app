import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Conectando a Supabase...");

  // 1. Obtener todas las becas actuales
  const { data: becasActuales, error: fetchError } = await supabase.from('becas').select('id');
  if (fetchError) {
    console.error("Error al obtener becas:", fetchError);
    return;
  }

  console.log(`Se encontraron ${becasActuales.length} becas actuales.`);

  // 2. Mantener solo la primera y borrar el resto
  if (becasActuales.length > 1) {
    const idsABorrar = becasActuales.slice(1).map(b => b.id);
    const { error: deleteError } = await supabase.from('becas').delete().in('id', idsABorrar);
    if (deleteError) {
      console.error("Error al borrar becas antiguas:", deleteError);
      return;
    }
    console.log(`Se borraron ${idsABorrar.length} becas, dejando 1 beca antigua.`);
  } else {
    console.log("No hay más de 1 beca para borrar.");
  }

  // 3. Leer el nuevo JSON
  const rawData = fs.readFileSync('datos_becas_peru_real.json', 'utf8');
  const nuevasBecas = JSON.parse(rawData);

  // 4. Mapear y preparar para inserción
  const insertData = nuevasBecas.map(item => ({
    id: item.id,
    titulo: item.titulo,
    sponsor: item.sponsor,
    cobertura: item.cobertura,
    requisitos: JSON.stringify(item.requisitos_estructurados),
    fecha_cierre: item.fecha_cierre,
    nivel: item.nivel,
    icono: "school", // valor por defecto
    sobre: item.sobre,
    beneficios: item.beneficios,
    afinidad: 85,
    documentos_requeridos: []
  }));

  console.log(`Insertando ${insertData.length} nuevas becas en Supabase...`);

  // 5. Insertar nuevas becas (batch insert)
  const { error: insertError } = await supabase.from('becas').insert(insertData);
  if (insertError) {
    console.error("Error al insertar nuevas becas:", insertError);
    return;
  }

  console.log("¡Inserción exitosa! Base de datos actualizada con las becas extraídas.");
}

main();
