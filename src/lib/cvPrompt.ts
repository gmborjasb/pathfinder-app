// CV Prompt utilities — LaTeX template + IA prompt builder (v2)
// Produces LaTeX code + polished HTML for PDF preview.

export const LATEX_TEMPLATE = String.raw`\documentclass[a4paper,12pt]{article}
\usepackage{url}
\usepackage{parskip}
\RequirePackage{color}
\RequirePackage{graphicx}
\usepackage[usenames,dvipsnames]{xcolor}
\usepackage[scale=0.9]{geometry}
\usepackage{tabularx}
\usepackage{enumitem}
\newcolumntype{C}{>{\centering\arraybackslash}X}
\usepackage{supertabular}
\newlength{\fullcollw}
\setlength{\fullcollw}{0.47\textwidth}
\usepackage{titlesec}
\usepackage{multicol}
\usepackage{multirow}
\titleformat{\section}{\Large\scshape\raggedright}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{10pt}{10pt}
\usepackage[unicode, draft=false]{hyperref}
\definecolor{linkcolour}{rgb}{0,0.2,0.6}
\hypersetup{colorlinks,breaklinks,urlcolor=linkcolour,linkcolor=linkcolour}

\newenvironment{jobshort}[2]
    {\begin{tabularx}{\linewidth}{@{}l X r@{}}
    \textbf{#1} & \hfill & #2 \\[3.75pt]
    \end{tabularx}}{}

\newenvironment{joblong}[2]
    {\begin{tabularx}{\linewidth}{@{}l X r@{}}
    \textbf{#1} & \hfill & #2 \\[3.75pt]
    \end{tabularx}
    \begin{minipage}[t]{\linewidth}
    \begin{itemize}[nosep,after=\strut, leftmargin=1em, itemsep=3pt,label=--]}
    {\end{itemize}\end{minipage}}

\begin{document}
\pagestyle{empty}

\begin{tabularx}{\linewidth}{@{} C @{}}
\Huge{NOMBRE_COMPLETO} \\[7.5pt]
\href{LINKEDIN_URL}{LinkedIn: LINKEDIN_USUARIO} \ $|$ \
\href{mailto:EMAIL}{EMAIL} \ $|$ \
\href{tel:TELEFONO}{TELEFONO}
\end{tabularx}

\section{Resumen}
RESUMEN_PROFESIONAL

\section{Experiencia Laboral}
EXPERIENCIA_BLOQUES

\section{Proyectos}
PROYECTOS_BLOQUES

\section{Educación}
\begin{tabularx}{\linewidth}{@{}l X@{}}
EDUCACION_FILAS
\end{tabularx}

\section{Habilidades}
\begin{tabularx}{\linewidth}{@{}l X@{}}
HABILIDADES_FILAS
\end{tabularx}

\vfill
\center{\footnotesize Última actualización: \today}
\end{document}`;

export interface ExperienciaItem {
  cargo: string;
  empresa: string;
  periodo: string;
  descripcion: string;
  esMúltiples: boolean;
}
export interface EducacionItem {
  grado: string;
  institucion: string;
  periodo: string;
  nota?: string;
}
export interface ProyectoItem {
  nombre: string;
  descripcion: string;
  link?: string;
}
export interface HabilidadItem {
  categoria: string;
  items: string;
}
export interface CVFormData {
  nombreCompleto: string;
  email: string;
  telefono: string;
  linkedin?: string;
  linkedinUsuario?: string;
  github?: string;
  sitioWeb?: string;
  resumen: string;
  experiencias: ExperienciaItem[];
  educacion: EducacionItem[];
  proyectos: ProyectoItem[];
  habilidades: HabilidadItem[];
}

export const SYSTEM_PROMPT_LATEX = `Eres un experto redactor de CVs académicos y profesionales.

Recibirás datos de un postulante y debes producir EXACTAMENTE dos bloques separados por "===HTML_START===".

== BLOQUE 1: CÓDIGO LATEX COMPLETO ==
Comienza con \\documentclass. Sigue la plantilla exactamente. Usa joblong para bullets, jobshort para descripción corta. Sin markdown ni explicaciones.

== BLOQUE 2: HTML DEL BODY DEL CV ==
Solo el contenido del body, sin DOCTYPE ni html/head/body tags.
Debe seguir esta estructura con estilos inline:

<div style="font-family:'Georgia',serif;width:210mm;min-height:297mm;box-sizing:border-box;margin:0 auto;padding:20mm;background:white;color:#1a1a1a;line-height:1.5;font-size:11pt;">
  <div style="text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid #1e293b;">
    <h1 style="margin:0 0 0.4rem;font-size:24pt;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;">NOMBRE</h1>
    <p style="margin:0;font-size:10pt;color:#444;line-height:1.8;">
      <a href="mailto:EMAIL" style="color:#003c90;text-decoration:none;">EMAIL</a> &nbsp;|&nbsp; TELEFONO &nbsp;|&nbsp; <a href="LINKEDIN" style="color:#003c90;text-decoration:none;">LinkedIn</a>
    </p>
  </div>

  <div style="margin-bottom:1.5rem;">
    <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.5rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Resumen</h2>
    <p style="margin:0;font-size:0.875rem;">RESUMEN</p>
  </div>

  <div style="margin-bottom:1.5rem;">
    <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Experiencia Laboral</h2>
    (repetir por cada experiencia)
    <div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <strong style="font-size:0.9rem;">CARGO</strong>
        <span style="font-size:0.8rem;color:#555;">PERIODO</span>
      </div>
      <div style="font-style:italic;font-size:0.85rem;color:#444;margin:2px 0 6px;">EMPRESA</div>
      <ul style="margin:0;padding-left:1.25rem;font-size:0.875rem;">
        <li style="margin-bottom:3px;">PUNTO 1</li>
      </ul>
    </div>
  </div>

  <div style="margin-bottom:1.5rem;">
    <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Proyectos</h2>
    (repetir por cada proyecto)
    <div style="margin-bottom:0.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <strong style="font-size:0.9rem;">NOMBRE</strong>
        <a href="LINK" style="font-size:0.8rem;color:#003c90;text-decoration:none;">Ver proyecto →</a>
      </div>
      <p style="margin:4px 0 0;font-size:0.875rem;color:#333;">DESCRIPCION</p>
    </div>
  </div>

  <div style="margin-bottom:1.5rem;">
    <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Educación</h2>
    (repetir por cada educacion)
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;flex-wrap:wrap;gap:4px;">
      <div><strong style="font-size:0.9rem;">GRADO</strong><span style="font-size:0.875rem;"> — <em>INSTITUCION</em></span></div>
      <span style="font-size:0.8rem;color:#555;">PERIODO — NOTA</span>
    </div>
  </div>

  <div style="margin-bottom:1rem;">
    <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Habilidades</h2>
    <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
      <tr><td style="font-weight:bold;padding:3px 16px 3px 0;white-space:nowrap;vertical-align:top;">CATEGORIA:</td><td style="padding:3px 0;">ITEMS</td></tr>
    </table>
  </div>

  <p style="text-align:center;font-size:0.75rem;color:#999;margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:0.75rem;">Última actualización: FECHA_HOY</p>
</div>

REGLAS ABSOLUTAS:
- NO uses bloques de codigo markdown.
- NO agregues explicaciones.
- Produce solo: LaTeX, luego "===HTML_START===", luego HTML del body.`;

export function buildLatexPrompt(data: CVFormData): string {
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return `Genera el CV del siguiente postulante. Fecha de hoy: ${fechaHoy}.

DATOS DEL POSTULANTE:
${JSON.stringify(data, null, 2)}

PLANTILLA LATEX:
${LATEX_TEMPLATE}

Responde: LaTeX completo → "===HTML_START===" → HTML del body.`;
}
