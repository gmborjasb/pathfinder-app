import re
import json

def parse_ts_array(file_content, array_name):
    # Find the array block in the file
    pattern = rf"export const {array_name}: \w+\[\] = \[(.*?)\];"
    match = re.search(pattern, file_content, re.DOTALL)
    if not match:
        # Try without type annotation
        pattern = rf"export const {array_name} = \[(.*?)\];"
        match = re.search(pattern, file_content, re.DOTALL)
        if not match:
            return []
    
    array_content = match.group(1)
    # Parse individual objects using regex matching curly braces
    obj_pattern = r"\{(.*?)\}"
    objs = re.findall(obj_pattern, array_content, re.DOTALL)
    
    parsed_items = []
    for obj in objs:
        item = {}
        # Clean lines and extract key-value pairs
        lines = obj.split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            # Match key: value
            parts = re.split(r':\s*', line, 1)
            if len(parts) == 2:
                key = parts[0].strip()
                val_str = parts[1].strip().rstrip(',')
                
                # Parse value
                if val_str.startswith('"') or val_str.startswith("'") or val_str.startswith("`"):
                    val = val_str[1:-1]
                elif val_str.startswith('[') and val_str.endswith(']'):
                    # Simple array parse
                    inner = val_str[1:-1].strip()
                    if inner:
                        val = [s.strip().strip('"').strip("'") for s in inner.split(',')]
                    else:
                        val = []
                else:
                    try:
                        val = int(val_str)
                    except ValueError:
                        try:
                            val = float(val_str)
                        except ValueError:
                            val = val_str
                
                item[key] = val
        if item:
            parsed_items.append(item)
    return parsed_items

# Read the dataBase.ts file
with open("/Users/gmborjasb/Desktop/VScode/FrontEnd/Proyecto V2/pathfinder-app/src/mocks/dataBase.ts", "r", encoding="utf-8") as f:
    content = f.read()

becas = parse_ts_array(content, "becasMockData")
charlas = parse_ts_array(content, "charlasMockData")
talleres = parse_ts_array(content, "talleresMockData")
cursos = parse_ts_array(content, "cursosMockData")

# Print counts to verify
print(f"Becas found: {len(becas)}")
print(f"Charlas found: {len(charlas)}")
print(f"Talleres found: {len(talleres)}")
print(f"Cursos found: {len(cursos)}")

# Generate SQL script
sql_output = []

# Becas INSERTs
sql_output.append("-- =========================================================================\n-- BECAS INSERTS\n-- =========================================================================\n")
for b in becas:
    # Handle array beneficios
    beneficios_json = json.dumps(b.get("beneficios", []), ensure_ascii=False)
    # Escape quotes
    title = b.get("title", "").replace("'", "''")
    sponsor = b.get("sponsor", "").replace("'", "''")
    coverage = b.get("coverage", "").replace("'", "''")
    requirement = b.get("requirement", "").replace("'", "''")
    sobre = b.get("sobre", "").replace("'", "''")
    level = b.get("level", "Pregrado")
    icon = b.get("icon", "school")
    affinity = b.get("affinity", 85)
    
    # Calculate closure date based on deadline or default
    deadline_str = b.get("deadline", "")
    days = 30
    match_days = re.search(r"(\d+)", deadline_str)
    if match_days:
        days = int(match_days.group(1))
    closure_date = f"CURRENT_DATE + INTERVAL '{days} days'"
    
    sql_output.append(
        f"INSERT INTO public.becas (id, titulo, sponsor, cobertura, requisitos, fecha_cierre, nivel, icono, sobre, beneficios, afinidad)\n"
        f"VALUES ('{b['id']}', '{title}', '{sponsor}', '{coverage}', '{requirement}', {closure_date}, '{level}', '{icon}', '{sobre}', '{beneficios_json}'::jsonb, {affinity})\n"
        f"ON CONFLICT (id) DO UPDATE SET\n"
        f"  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, cobertura = EXCLUDED.cobertura, requisitos = EXCLUDED.requisitos,\n"
        f"  nivel = EXCLUDED.nivel, icono = EXCLUDED.icono, sobre = EXCLUDED.sobre, beneficios = EXCLUDED.beneficios, afinidad = EXCLUDED.afinidad;\n"
    )

# Charlas INSERTs
sql_output.append("\n-- =========================================================================\n-- CHARLAS INSERTS\n-- =========================================================================\n")
for c in charlas:
    title = c.get("title", "").replace("'", "''")
    sponsor = c.get("sponsor", "").replace("'", "''")
    modality = c.get("modality", "").replace("'", "''")
    dateTime = c.get("dateTime", "").replace("'", "''")
    actionText = c.get("actionText", "").replace("'", "''")
    sql_output.append(
        f"INSERT INTO public.charlas (id, titulo, sponsor, modalidad, fecha_hora, texto_accion)\n"
        f"VALUES ('{c['id']}', '{title}', '{sponsor}', '{modality}', '{dateTime}', '{actionText}')\n"
        f"ON CONFLICT (id) DO UPDATE SET\n"
        f"  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, modalidad = EXCLUDED.modalidad, fecha_hora = EXCLUDED.fecha_hora, texto_accion = EXCLUDED.texto_accion;\n"
    )

# Talleres INSERTs
sql_output.append("\n-- =========================================================================\n-- TALLERES INSERTS\n-- =========================================================================\n")
for t in talleres:
    title = t.get("title", "").replace("'", "''")
    sponsor = t.get("sponsor", "").replace("'", "''")
    statusFrequency = t.get("statusFrequency", "").replace("'", "''")
    focus = t.get("focus", "").replace("'", "''")
    actionText = t.get("actionText", "").replace("'", "''")
    sql_output.append(
        f"INSERT INTO public.talleres (id, titulo, sponsor, frecuencia_estado, enfoque, texto_accion)\n"
        f"VALUES ('{t['id']}', '{title}', '{sponsor}', '{statusFrequency}', '{focus}', '{actionText}')\n"
        f"ON CONFLICT (id) DO UPDATE SET\n"
        f"  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, frecuencia_estado = EXCLUDED.frecuencia_estado, enfoque = EXCLUDED.enfoque, texto_accion = EXCLUDED.texto_accion;\n"
    )

# Cursos INSERTs
sql_output.append("\n-- =========================================================================\n-- CURSOS INSERTS\n-- =========================================================================\n")
for cu in cursos:
    title = cu.get("title", "").replace("'", "''")
    sponsor = cu.get("sponsor", "").replace("'", "''")
    duration = cu.get("duration", "").replace("'", "''")
    requirement = cu.get("requirement", "").replace("'", "''")
    status = cu.get("status", "").replace("'", "''")
    sql_output.append(
        f"INSERT INTO public.cursos_capacitacion (id, titulo, sponsor, duracion, requisitos, estado)\n"
        f"VALUES ('{cu['id']}', '{title}', '{sponsor}', '{duration}', '{requirement}', '{status}')\n"
        f"ON CONFLICT (id) DO UPDATE SET\n"
        f"  titulo = EXCLUDED.titulo, sponsor = EXCLUDED.sponsor, duracion = EXCLUDED.duracion, requisitos = EXCLUDED.requisitos, estado = EXCLUDED.estado;\n"
    )

# Write output file
with open("/Users/gmborjasb/Desktop/VScode/FrontEnd/Proyecto V2/pathfinder-app/inserts.sql", "w", encoding="utf-8") as out:
    out.write("\n".join(sql_output))

print("SQL insert script generated at inserts.sql successfully!")
