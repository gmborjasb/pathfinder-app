import type { CVFormData } from './cvPrompt';

function formatDate(): string {
  return new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function buildLinkedInUrl(data: CVFormData): string {
  if (data.linkedin) return data.linkedin;
  if (data.linkedinUsuario) return `https://linkedin.com/in/${data.linkedinUsuario}`;
  return '';
}

function buildExperienciaHtml(items: CVFormData['experiencias']): string {
  return items.filter(e => e.cargo || e.empresa).map(exp => {
    const descHtml = exp.esMúltiples
      ? `<ul style="margin:0;padding-left:1.25rem;font-size:0.875rem;">${exp.descripcion.split('\n').filter(Boolean).map(l => `<li style="margin-bottom:3px;">${escHtml(l)}</li>`).join('')}</ul>`
      : `<p style="margin:4px 0 0;font-size:0.875rem;color:#333;">${escHtml(exp.descripcion)}</p>`;
    return `<div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <strong style="font-size:0.9rem;">${escHtml(exp.cargo)}</strong>
        <span style="font-size:0.8rem;color:#555;">${escHtml(exp.periodo)}</span>
      </div>
      <div style="font-style:italic;font-size:0.85rem;color:#444;margin:2px 0 6px;">${escHtml(exp.empresa)}</div>
      ${descHtml}
    </div>`;
  }).join('\n');
}

function buildEducacionHtml(items: CVFormData['educacion']): string {
  return items.filter(e => e.grado || e.institucion).map(edu => {
    const notaStr = edu.nota ? ` — ${escHtml(edu.nota)}` : '';
    return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;flex-wrap:wrap;gap:4px;">
      <div><strong style="font-size:0.9rem;">${escHtml(edu.grado)}</strong><span style="font-size:0.875rem;"> — <em>${escHtml(edu.institucion)}</em></span></div>
      <span style="font-size:0.8rem;color:#555;">${escHtml(edu.periodo)}${notaStr}</span>
    </div>`;
  }).join('\n');
}

function buildProyectosHtml(items: CVFormData['proyectos']): string {
  return items.filter(p => p.nombre || p.descripcion).map(proj => {
    const linkHtml = proj.link
      ? `<a href="${escHtml(proj.link)}" style="font-size:0.8rem;color:#003c90;text-decoration:none;">Ver proyecto →</a>`
      : '';
    return `<div style="margin-bottom:0.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <strong style="font-size:0.9rem;">${escHtml(proj.nombre)}</strong>
        ${linkHtml}
      </div>
      <p style="margin:4px 0 0;font-size:0.875rem;color:#333;">${escHtml(proj.descripcion)}</p>
    </div>`;
  }).join('\n');
}

function buildHabilidadesHtml(items: CVFormData['habilidades']): string {
  return items.filter(h => h.categoria || h.items).map(h => {
    const itemsList = h.items.split(',').map(s => s.trim()).filter(Boolean).join(', ');
    return `<tr><td style="font-weight:bold;padding:3px 16px 3px 0;white-space:nowrap;vertical-align:top;font-size:0.875rem;">${escHtml(h.categoria)}:</td><td style="padding:3px 0;font-size:0.875rem;">${escHtml(itemsList)}</td></tr>`;
  }).join('\n');
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildLocalCVHtml(data: CVFormData): string {
  const linkedinUrl = buildLinkedInUrl(data);
  const linkedinHtml = linkedinUrl
    ? `&nbsp;|&nbsp; <a href="${escHtml(linkedinUrl)}" style="color:#003c90;text-decoration:none;">LinkedIn</a>`
    : '';

  const contactoArr = [data.email, data.telefono].filter(Boolean);
  const contactoStr = contactoArr.join(' &nbsp;|&nbsp; ');

  const hasExperiencia = data.experiencias.some(e => e.cargo || e.empresa);
  const hasProyectos = data.proyectos.some(p => p.nombre || p.descripcion);
  const hasHabilidades = data.habilidades.some(h => h.categoria || h.items);

  return `<div style="font-family:'Georgia',serif;width:210mm;min-height:297mm;box-sizing:border-box;margin:0 auto;padding:20mm;background:white;color:#1a1a1a;line-height:1.5;font-size:11pt;">
    <div style="text-align:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid #1e293b;">
      <h1 style="margin:0 0 0.4rem;font-size:24pt;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;">${escHtml(data.nombreCompleto)}</h1>
      ${contactoStr || linkedinHtml ? `<p style="margin:0;font-size:10pt;color:#444;line-height:1.8;">
        <a href="mailto:${escHtml(data.email)}" style="color:#003c90;text-decoration:none;">${escHtml(data.email)}</a> &nbsp;|&nbsp; ${escHtml(data.telefono)}${linkedinHtml}
      </p>` : ''}
    </div>

    ${data.resumen ? `<div style="margin-bottom:1.5rem;">
      <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.5rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Resumen</h2>
      <p style="margin:0;font-size:0.875rem;">${escHtml(data.resumen)}</p>
    </div>` : ''}

    ${hasExperiencia ? `<div style="margin-bottom:1.5rem;">
      <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Experiencia Laboral</h2>
      ${buildExperienciaHtml(data.experiencias)}
    </div>` : ''}

    ${hasProyectos ? `<div style="margin-bottom:1.5rem;">
      <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Proyectos y Reconocimientos</h2>
      ${buildProyectosHtml(data.proyectos)}
    </div>` : ''}

    ${data.educacion.some(e => e.grado || e.institucion) ? `<div style="margin-bottom:1.5rem;">
      <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Educaci\u00f3n</h2>
      ${buildEducacionHtml(data.educacion)}
    </div>` : ''}

    ${hasHabilidades ? `<div style="margin-bottom:1rem;">
      <h2 style="font-size:0.9rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 0.75rem;padding-bottom:3px;border-bottom:1px solid #1e293b;">Habilidades</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${buildHabilidadesHtml(data.habilidades)}
      </table>
    </div>` : ''}

    <p style="text-align:center;font-size:0.75rem;color:#999;margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:0.75rem;">\u00daltima actualizaci\u00f3n: ${formatDate()}</p>
  </div>`;
}
