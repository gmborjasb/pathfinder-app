"""
Rellena `becas.documentos_requeridos` para las becas del `supabase_schema.sql`
que quedaron con el default '[]' (no se incluyeron en su INSERT original).

Estrategia (honesta, no finge scraping donde no lo hay):
  1. Parsear supabase_schema.sql para obtener (id, titulo, sponsor, nivel) de
     cada beca y detectar cuáles YA tienen documentos_requeridos poblado
     (esas se omiten).
  2. Para las que faltan, si el sponsor coincide con una URL real conocida
     (SPONSOR_URLS, reutilizado de scrape_masivo.py), se intenta un scraping
     best-effort: buscar en el HTML un encabezado/párrafo con "requisito"
     o "documento" y tomar la lista <ul>/<ol> más cercana si tiene >= 2 items
     de texto plausible.
  3. Si no hay URL o la extracción no produjo nada usable, se usa la
     plantilla curada por nivel (misma función que ya existía en
     scrape_masivo.py: get_documentos_requeridos), en vez de dejarlo vacío.
  4. Se escribe backfill_documentos_requeridos.sql con un UPDATE por beca,
     usando los IDs reales (BEC-XX) — no se toca ni se ejecuta nada contra
     Supabase directamente (RLS de esa tabla solo permite lectura pública).
"""

import json
import re
import time
import requests
from bs4 import BeautifulSoup

SCHEMA_FILE = "supabase_schema.sql"
OUTPUT_SQL = "backfill_documentos_requeridos.sql"

# URLs reales conocidas por sponsor (subconjunto reutilizado de scrape_masivo.py,
# ampliado con los sponsors que aparecen en supabase_schema.sql).
SPONSOR_URLS = {
    "PRONABEC": "https://www.pronabec.gob.pe/beca-18/",
    "Patronato BCP": "https://www.becasbcp.com/",
    "Pontificia Universidad Católica": "https://www.pucp.edu.pe/becas/",
    "Universidad de Ingeniería y Tecnología": "https://utec.edu.pe/becas",
    "Embajada de EE.UU. / ICPNA": "https://pe.usembassy.gov/education-culture/",
    "Universidad del Pacífico": "https://www.up.edu.pe/becas/",
    "Universidad de Lima": "https://www.ulima.edu.pe/becas/",
    "TECSUP": "https://www.tecsup.edu.pe/becas",
    "Asociación Cultural Peruano Británica": "https://www.britanico.edu.pe/",
    "Universidad Nacional Mayor de San Marcos": "https://www.unmsm.edu.pe/",
}

# Solo "documento" — "requisito" en sitios peruanos casi siempre introduce
# condiciones de elegibilidad (edad, pobreza, etc.), no un checklist de
# archivos a subir, y mezclar ambos produciría "documentos" engañosos.
DOC_KEYWORDS = re.compile(r"document", re.IGNORECASE)
# Palabras que sí delatan que un ítem de lista es un documento/archivo real.
DOC_ITEM_HINTS = re.compile(
    r"copia|certificado|constancia|dni|partida|carta|curriculum|\bcv\b|foto|ficha|declaraci[oó]n jurada|title|t[ií]tulo",
    re.IGNORECASE,
)


def get_documentos_requeridos(nivel: str):
    """Plantilla curada por nivel (idéntica a la ya usada en scrape_masivo.py)."""
    comunes = [
        {"id": 1, "name": "DNI Postulante", "description": "Copia legible por ambos lados.", "es_requerido": True, "category": "Identidad", "documentIcon": "badge"},
        {"id": 2, "name": "Partida de Nacimiento", "description": "Copia legalizada o fedateada emitida por RENIEC.", "es_requerido": True, "category": "Identidad", "documentIcon": "badge"},
    ]
    if "Pregrado" in nivel or "Técnico" in nivel:
        return comunes + [
            {"id": 3, "name": "Certificado de Estudios", "description": "Certificado oficial de 1ero a 5to de secundaria.", "es_requerido": True, "category": "Académico", "documentIcon": "school"},
            {"id": 4, "name": "Ficha SISFOH", "description": "Clasificación socioeconómica vigente.", "es_requerido": True, "category": "Socioeconómico", "documentIcon": "account_balance"},
            {"id": 5, "name": "Carta de Motivación", "description": "Ensayo personal explicando por qué mereces la beca.", "es_requerido": False, "category": "Académico", "documentIcon": "description"},
        ]
    if "Postgrado" in nivel or "Doctorado" in nivel:
        return comunes + [
            {"id": 6, "name": "Título Universitario", "description": "Copia del grado académico (bachiller/título).", "es_requerido": True, "category": "Académico", "documentIcon": "school"},
            {"id": 7, "name": "Curriculum Vitae", "description": "CV actualizado que resuma formación y experiencia.", "es_requerido": True, "category": "Académico", "documentIcon": "description"},
            {"id": 8, "name": "Certificado de Inglés", "description": "TOEFL iBT 80+ o IELTS 6.5+ según el programa.", "es_requerido": True, "category": "Idiomas", "documentIcon": "language"},
            {"id": 9, "name": "Cartas de Recomendación (2)", "description": "Dos cartas de profesores o empleadores.", "es_requerido": True, "category": "Académico", "documentIcon": "badge"},
        ]
    if "Idioma" in nivel:
        return comunes + [
            {"id": 10, "name": "Certificado de Estudios", "description": "Historial académico reciente.", "es_requerido": True, "category": "Académico", "documentIcon": "school"},
            {"id": 11, "name": "Constancia de Matrícula", "description": "Constancia vigente del colegio o instituto.", "es_requerido": True, "category": "Académico", "documentIcon": "school"},
        ]
    return comunes + [
        {"id": 12, "name": "Certificado de Estudios", "description": "Historial académico reciente.", "es_requerido": True, "category": "Académico", "documentIcon": "school"},
        {"id": 13, "name": "Carta de Postulación", "description": "Carta de motivación dirigida al comité.", "es_requerido": True, "category": "Académico", "documentIcon": "description"},
    ]


def parse_schema_becas(path: str):
    """Extrae (id, titulo, sponsor, nivel, ya_tiene_documentos) de cada INSERT INTO public.becas."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    becas = []
    # Cada bloque empieza en "INSERT INTO public.becas (...)" y su VALUES en la línea siguiente.
    for match in re.finditer(
        r"INSERT INTO public\.becas \(([^)]*)\)\s*\nVALUES\s*\('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',.*?'((?:[^']|'')*)',\s*'[a-z_0-9]+'",
        text,
    ):
        columnas, beca_id, titulo, sponsor, nivel = match.groups()
        ya_tiene_documentos = "documentos_requeridos" in columnas
        becas.append({
            "id": beca_id,
            "titulo": titulo.replace("''", "'"),
            "sponsor": sponsor.replace("''", "'"),
            "nivel": nivel,
            "ya_tiene_documentos": ya_tiene_documentos,
        })
    return becas


def try_scrape(url: str):
    """Best-effort: busca una lista <ul>/<ol> cercana a un encabezado con 'documento',
    y solo la acepta si la mayoría de sus ítems suenan a documentos reales
    (no a condiciones de elegibilidad)."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        res = requests.get(url, headers=headers, timeout=8)
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")

        for heading in soup.find_all(["h1", "h2", "h3", "h4", "strong", "p"]):
            if not heading.text or not DOC_KEYWORDS.search(heading.text):
                continue
            lista = heading.find_next(["ul", "ol"])
            if not lista:
                continue
            items = [li.get_text(strip=True) for li in lista.find_all("li")]
            items = [i for i in items if 5 < len(i) < 200]
            if len(items) < 2:
                continue
            con_pinta_de_documento = sum(1 for i in items if DOC_ITEM_HINTS.search(i))
            if con_pinta_de_documento < len(items) / 2:
                continue
            return items[:8]
        return None
    except Exception:
        return None


def _truncar(texto: str, largo: int = 100) -> str:
    if len(texto) <= largo:
        return texto
    corte = texto[:largo].rsplit(" ", 1)[0]
    return corte + "…"


def items_to_documentos(items):
    """Convierte líneas de texto scrapeadas a la forma DocumentoRequerido."""
    docs = []
    for idx, texto in enumerate(items, start=1):
        docs.append({
            "id": idx,
            "name": _truncar(texto),
            "description": "Extraído del sitio oficial de la beca.",
            "es_requerido": True,
            "category": "General",
            "documentIcon": "description",
        })
    return docs


def main():
    becas = parse_schema_becas(SCHEMA_FILE)
    pendientes = [b for b in becas if not b["ya_tiene_documentos"]]

    print(f"Becas totales encontradas: {len(becas)}")
    print(f"Becas sin documentos_requeridos: {len(pendientes)}")

    statements = []
    for beca in pendientes:
        url = SPONSOR_URLS.get(beca["sponsor"])
        documentos = None
        fuente = "template"

        if url:
            print(f"Intentando scraping real para {beca['id']} ({beca['sponsor']}) -> {url}")
            items = try_scrape(url)
            if items:
                documentos = items_to_documentos(items)
                fuente = "scraped"
            time.sleep(0.5)

        if documentos is None:
            documentos = get_documentos_requeridos(beca["nivel"])

        print(f"  {beca['id']}: {len(documentos)} documentos ({fuente})")

        jsonb = json.dumps(documentos, ensure_ascii=False).replace("'", "''")
        statements.append(
            f"UPDATE public.becas SET documentos_requeridos = '{jsonb}'::jsonb "
            f"WHERE id = '{beca['id']}'; -- {beca['titulo']} ({fuente})"
        )

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("-- Backfill de documentos_requeridos para becas sin ese campo poblado.\n")
        f.write("-- Generado por enrich_documentos_requeridos.py — revisar antes de ejecutar.\n\n")
        f.write("\n".join(statements))
        f.write("\n")

    print(f"\n✅ {OUTPUT_SQL} generado con {len(statements)} sentencias UPDATE.")


if __name__ == "__main__":
    main()
