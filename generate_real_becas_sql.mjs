import fs from 'fs';

const rawData = fs.readFileSync('datos_becas_peru_real.json', 'utf8');
const becas = JSON.parse(rawData);

let sql = `-- =======================================================================
-- SCRIPT DE ACTUALIZACIÓN DE BECAS (SUPABASE)
-- =======================================================================

-- 1. MANTENER SOLO 1 BECA (LA MÁS ANTIGUA) Y BORRAR EL RESTO
DELETE FROM public.becas 
WHERE id NOT IN (
    SELECT id FROM public.becas ORDER BY id LIMIT 1
);

-- 2. INSERTAR NUEVAS BECAS (REALES)
INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad, url_oficial) VALUES
`;

const values = becas.map(b => {
    const title = b.titulo.replace(/'/g, "''");
    const sponsor = b.sponsor.replace(/'/g, "''");
    const cobertura = b.cobertura.replace(/'/g, "''");
    const reqStr = JSON.stringify(b.requisitos_estructurados).replace(/'/g, "''");
    const fecha = b.fecha_cierre;
    const nivel = b.nivel.replace(/'/g, "''");
    const sobre = b.sobre.replace(/'/g, "''");
    const benStr = JSON.stringify(b.beneficios).replace(/'/g, "''");
    const url_oficial = b.url_oficial ? b.url_oficial.replace(/'/g, "''") : null;
    const urlValue = url_oficial ? `'${url_oficial}'` : 'NULL';
    
    return `('${b.id}', '${title}', '${sponsor}', '${cobertura}', '${reqStr}', '${fecha}', '${nivel}', 'school', '${sobre}', '${benStr}'::jsonb, 85, ${urlValue})`;
});

sql += values.join(',\n') + '\n';
sql += "ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos, fecha_cierre = EXCLUDED.fecha_cierre, nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad, url_oficial = EXCLUDED.url_oficial;\n";

fs.writeFileSync('update_becas.sql', sql);
console.log("✅ Archivo update_becas.sql generado exitosamente.");
