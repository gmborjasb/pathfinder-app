const fs = require('fs');

const path = 'datos_becas_peru_real.json';
let becas = JSON.parse(fs.readFileSync(path, 'utf8'));

const newBecas = [
  {
    id: "beca-peru-2026",
    titulo: "Beca Perú - Convocatoria 2026",
    sponsor: "PRONABEC",
    cobertura: "Cobertura parcial y total de costos académicos.",
    requisitos: "Ser peruano, haber terminado el colegio secundario, tener buen rendimiento académico.",
    fecha_cierre: "2026-07-08",
    nivel: "Pregrado",
    sobre: "La Beca Perú ofrece a jóvenes talentos la oportunidad de estudiar en instituciones privadas elegibles para fortalecer su educación superior.",
    beneficios: ["Matrícula y pensiones de estudio", "Materiales de estudio", "Gastos de titulación"],
    requisitos_estructurados: {
      nota_minima: 14.0,
      sisfoh: "Pobreza Extrema",
      tipo_colegio: "Público",
      requiere_mujeres: false
    },
    url_oficial: "https://www.pronabec.gob.pe/beca-peru/"
  },
  {
    id: "beca-continuidad-2026",
    titulo: "Beca Continuidad de Estudios 2026",
    sponsor: "PRONABEC",
    cobertura: "Cobertura total de la pensión universitaria.",
    requisitos: "Estudiantes de educación superior que se hayan visto afectados socioeconómicamente.",
    fecha_cierre: "2026-08-15",
    nivel: "Pregrado",
    sobre: "Programa diseñado para evitar la deserción de estudiantes de universidades e institutos públicos y privados.",
    beneficios: ["Matrícula", "Pensiones académicas", "Manutención"],
    requisitos_estructurados: {
      nota_minima: 12.0,
      sisfoh: "Pobre",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.pronabec.gob.pe/beca-continuidad/"
  },
  {
    id: "beca-cometa-2026",
    titulo: "Beca Cometa - Convocatoria 2026",
    sponsor: "Intercorp",
    cobertura: "Cobertura del 100% para estudios universitarios en universidades de élite de EE.UU.",
    requisitos: "Ser escolar peruano con rendimiento sobresaliente y demostrar necesidades económicas.",
    fecha_cierre: "2026-09-30",
    nivel: "Pregrado",
    sobre: "Beca Cometa es una iniciativa de Intercorp que busca formar a los futuros líderes del Perú brindándoles acceso a educación de clase mundial.",
    beneficios: ["Matrícula en universidad Top EE.UU.", "Pasajes aéreos", "Seguro médico", "Manutención y alojamiento"],
    requisitos_estructurados: {
      nota_minima: 16.0,
      sisfoh: "Pobre",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.becacometa.com"
  },
  {
    id: "beca-jovenes-bicentenario",
    titulo: "Beca Jóvenes Bicentenario",
    sponsor: "Ministerio de Trabajo y Promoción del Empleo",
    cobertura: "Capacitación 100% gratuita para inserción laboral.",
    requisitos: "Jóvenes entre 18 y 29 años, en situación de desempleo o subempleo.",
    fecha_cierre: "2026-08-31",
    nivel: "Técnico",
    sobre: "Programa del Estado Peruano enfocado en potenciar la empleabilidad juvenil en los sectores productivos de mayor demanda.",
    beneficios: ["Cursos gratuitos", "Certificación oficial", "Acompañamiento laboral"],
    requisitos_estructurados: {
      nota_minima: null,
      sisfoh: "Pobre",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.gob.pe/mtpe"
  },
  {
    id: "beca-talento-pucp",
    titulo: "Beca Talento PUCP",
    sponsor: "Pontificia Universidad Católica del Perú",
    cobertura: "Cobertura de derechos académicos según la escala socioeconómica asignada.",
    requisitos: "Destacado perfil académico, participación en concursos de escolares y examen de admisión aprobado.",
    fecha_cierre: "2026-10-15",
    nivel: "Pregrado",
    sobre: "Reconoce el esfuerzo y el talento escolar de los estudiantes de secundaria a nivel nacional para ingresar a la PUCP.",
    beneficios: ["Descuento o cobertura total de escalas de pago", "Bono de libros", "Asesoría académica personalizada"],
    requisitos_estructurados: {
      nota_minima: 15.0,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.pucp.edu.pe/becas"
  },
  {
    id: "beca-prociencia-2026",
    titulo: "Beca de Investigación ProCiencia",
    sponsor: "CONCYTEC",
    cobertura: "Financiamiento de investigación y estipendio mensual.",
    requisitos: "Estudiantes de posgrado matriculados en programas acreditados enfocados en ciencia y tecnología.",
    fecha_cierre: "2026-07-30",
    nivel: "Maestría",
    sobre: "Auspiciada por CONCYTEC, apoya a los investigadores en desarrollo que contribuyen al avance científico del país.",
    beneficios: ["Subvención mensual", "Financiamiento de la investigación", "Acceso a redes internacionales"],
    requisitos_estructurados: {
      nota_minima: 14.0,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.prociencia.gob.pe"
  },
  {
    id: "beca-loreal-unesco-peru",
    titulo: "Beca L'Oréal-UNESCO Para las Mujeres en la Ciencia",
    sponsor: "L'Oréal Perú y CONCYTEC",
    cobertura: "Premio económico para la continuación de proyectos científicos.",
    requisitos: "Mujeres investigadoras de nacionalidad peruana con proyectos en curso en áreas STEM.",
    fecha_cierre: "2026-08-20",
    nivel: "Maestría",
    sobre: "Reconocimiento a mujeres científicas sobresalientes para visibilizar y apoyar su labor en el desarrollo científico del país.",
    beneficios: ["Premio económico directo", "Reconocimiento nacional", "Difusión del proyecto científico"],
    requisitos_estructurados: {
      nota_minima: 15.0,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: true
    },
    url_oficial: "https://www.concytec.gob.pe"
  },
  {
    id: "beca-ingles-access",
    titulo: "Beca Inglés Access",
    sponsor: "Embajada de EE.UU. e ICPNA",
    cobertura: "Cobertura total del programa de estudios de idioma inglés por 2 años.",
    requisitos: "Escolares de secundaria de recursos económicos limitados, buen rendimiento y liderazgo.",
    fecha_cierre: "2026-11-01",
    nivel: "Idioma",
    sobre: "Brinda fundamentos del idioma inglés y de la cultura estadounidense a estudiantes talentosos, abriendo oportunidades futuras.",
    beneficios: ["Clases de inglés 100% financiadas", "Materiales y libros", "Campamentos y actividades extracurriculares"],
    requisitos_estructurados: {
      nota_minima: 14.0,
      sisfoh: "Pobre",
      tipo_colegio: "Público",
      requiere_mujeres: false
    },
    url_oficial: "https://pe.usembassy.gov/es/education-culture-es/access/"
  },
  {
    id: "becas-coursera-mtpe",
    titulo: "Becas Coursera - Talento Digital",
    sponsor: "Ministerio de Trabajo / Google",
    cobertura: "Acceso gratuito a certificaciones de alto nivel.",
    requisitos: "Jóvenes peruanos interesados en el área de tecnología (UX/UI, Data, IT).",
    fecha_cierre: "2026-12-15",
    nivel: "Técnico",
    sobre: "Alianza del MTPE para reducir la brecha tecnológica ofreciendo certificaciones avaladas por gigantes tecnológicos.",
    beneficios: ["Acceso gratis a cursos premium en Coursera", "Certificado oficial de Google/IBM", "Bolsa de trabajo del MTPE"],
    requisitos_estructurados: {
      nota_minima: null,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.mtpe.gob.pe/talento-digital"
  },
  {
    id: "beca-erasmus-peru",
    titulo: "Becas Erasmus+ Mundus",
    sponsor: "Unión Europea",
    cobertura: "Financiamiento completo para maestrías conjuntas en Europa.",
    requisitos: "Título de bachiller universitario peruano, alto nivel de inglés (IELTS/TOEFL).",
    fecha_cierre: "2026-02-15",
    nivel: "Maestría",
    sobre: "Una de las becas internacionales más prestigiosas del mundo que permite estudiar posgrados en al menos dos países europeos.",
    beneficios: ["Matrícula 100%", "Mensualidad de 1000 - 1400 euros", "Pasajes aéreos ida y vuelta", "Seguro de viaje"],
    requisitos_estructurados: {
      nota_minima: 15.0,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://erasmus-plus.ec.europa.eu"
  },
  {
    id: "beca-excelencia-idat",
    titulo: "Beca Excelencia Académica Idat",
    sponsor: "IDAT",
    cobertura: "Becas del 50% al 100% sobre la pensión mensual.",
    requisitos: "Egresados de colegios con promedios mayores a 15 y que superen la entrevista de admisión con excelencia.",
    fecha_cierre: "2026-08-30",
    nivel: "Técnico",
    sobre: "Premia a los talentos escolares para iniciar estudios técnicos profesionales enfocados en tecnología y negocios.",
    beneficios: ["Descuento en pensión mensual", "Material didáctico online", "Bolsa de empleo rápida"],
    requisitos_estructurados: {
      nota_minima: 15.0,
      sisfoh: "Cualquiera",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.idat.edu.pe"
  },
  {
    id: "beca-ensabap-2026",
    titulo: "Beca para Artistas Destacados ENSABAP",
    sponsor: "Escuela Nacional Superior Autónoma de Bellas Artes del Perú",
    cobertura: "Cobertura de derechos académicos.",
    requisitos: "Destacado talento en artes plásticas y visuales mediante prueba de aptitud.",
    fecha_cierre: "2026-11-20",
    nivel: "Pregrado",
    sobre: "Brinda la posibilidad de desarrollar el talento artístico a los jóvenes con alta proyección visual y artística a nivel nacional.",
    beneficios: ["Exoneración de pago de pensión", "Acceso a talleres artísticos", "Materiales seleccionados"],
    requisitos_estructurados: {
      nota_minima: 13.0,
      sisfoh: "Pobre",
      tipo_colegio: "Cualquiera",
      requiere_mujeres: false
    },
    url_oficial: "https://www.ensabap.edu.pe"
  }
];

// Combine existing avoiding duplicates
const existingIds = new Set(becas.map(b => b.id));
let added = 0;
for (const nb of newBecas) {
  if (!existingIds.has(nb.id)) {
    becas.push(nb);
    added++;
  }
}

fs.writeFileSync(path, JSON.stringify(becas, null, 2));
console.log('Nuevas becas añadidas:', added);
console.log('Total de becas:', becas.length);
