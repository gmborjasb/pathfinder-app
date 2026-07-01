import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CVPreviewPanel } from '../components/cv/CVPreviewPanel';
import type { CVFormData, ExperienciaItem, EducacionItem, ProyectoItem, HabilidadItem } from '../lib/cvPrompt';
import { SYSTEM_PROMPT_LATEX, buildLatexPrompt } from '../lib/cvPrompt';
import { buildLocalCVHtml } from '../lib/cvHtmlTemplate';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const EMPTY_EXPERIENCIA: ExperienciaItem = {
  cargo: '', empresa: '', periodo: '', descripcion: '', esMúltiples: true,
};
const EMPTY_EDUCACION: EducacionItem = {
  grado: '', institucion: '', periodo: '', nota: '',
};
const EMPTY_PROYECTO: ProyectoItem = {
  nombre: '', descripcion: '', link: '',
};
const EMPTY_HABILIDAD: HabilidadItem = {
  categoria: '', items: '',
};

export default function GenerarCV() {
  const { profile } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<CVFormData>({
    nombreCompleto: '',
    email: '',
    telefono: '',
    linkedin: '',
    linkedinUsuario: '',
    github: '',
    sitioWeb: '',
    resumen: '',
    experiencias: [{ ...EMPTY_EXPERIENCIA }],
    educacion: [{ ...EMPTY_EDUCACION }],
    proyectos: [{ ...EMPTY_PROYECTO }],
    habilidades: [
      { categoria: 'Idiomas', items: '' },
      { categoria: 'Tecnologías', items: '' },
    ],
  });

  const [latexCode, setLatexCode] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceHtmlTab, setForceHtmlTab] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const pd = (profile.perfil_detalles as Record<string, unknown>) || {};
    const idiomas = (pd.idiomas as Record<string, string>) || {};
    const notas = (pd.notas as Record<string, number>) || {};
    const anoEgreso = ((pd.colegio as Record<string, unknown>)?.ano_egreso as string) || '';
    const institucion = (pd.institucionActual as string) || '';
    const areaInteres = (profile.area_interes as string) || '';
    const merito = (profile.merito_academico as string) || '';
    const nivelIngles = idiomas.nivelIngles || 'Ninguno';
    const institutoCertif = idiomas.instituto || '';
    const esDeportista = profile.es_deportista as boolean;
    const haceVoluntariado = profile.hace_voluntariado as boolean;

    // Build suggested summary
    const resumenParts: string[] = [];
    if (institucion) resumenParts.push(`Estudiante de ${institucion}`);
    if (areaInteres) resumenParts.push(`con interés en ${areaInteres}`);
    if (merito === 'quinto') resumenParts.push('en el tercio superior de mi promoción');
    else if (merito === 'tercio') resumenParts.push('en el tercio superior');
    if (nivelIngles !== 'Ninguno') resumenParts.push(`con inglés nivel ${nivelIngles}`);
    if (haceVoluntariado) resumenParts.push('con experiencia en voluntariado');
    if (esDeportista) resumenParts.push('y deportista destacado');

    const resumenSugerido = resumenParts.length > 0
      ? resumenParts.join(', ') + '.'
      : '';

    // Build idiomas string
    const idiomasArr = ['Español (Nativo)'];
    if (nivelIngles !== 'Ninguno') {
      idiomasArr.push(`Inglés (${nivelIngles})${institutoCertif ? ` — ${institutoCertif}` : ''}`);
    }

    // Build notas string
    const notaMaxima = Math.max(notas.año3 || 0, notas.año4 || 0, notas.año5 || 0);
    const notaStr = notaMaxima > 0 ? `Promedio: ${notaMaxima}/20` : '';

    // Build voluntariado experiencia if exists
    const expExtras: ExperienciaItem[] = [];
    if (haceVoluntariado) {
      expExtras.push({
        cargo: 'Voluntario',
        empresa: 'Organización sin fines de lucro',
        periodo: '2023 - Presente',
        descripcion: 'Apoyo en actividades comunitarias y proyectos de impacto social.',
        esMúltiples: false,
      });
    }

    setForm(prev => ({
      ...prev,
      nombreCompleto: (profile.nombres as string) || 'María Fernanda Torres',
      email: (profile.correo as string) || 'm.fernanda.torres@email.com',
      telefono: '987 654 321',
      linkedinUsuario: 'mariafernanda-t',
      resumen: prev.resumen || 'Estudiante de Ingeniería de Sistemas en el quinto superior, con gran interés en el desarrollo de software, inteligencia artificial y gestión de proyectos. Destacada por mi liderazgo en el tercio superior y mi nivel avanzado de inglés. Busco oportunidades para aplicar mis conocimientos técnicos y habilidades blandas en un entorno desafiante.',
      educacion: [
        {
          grado: institucion ? `Estudiante de ${institucion}` : 'Ingeniería de Sistemas',
          institucion: institucion || 'Universidad Nacional de Ingeniería (UNI)',
          periodo: `${anoEgreso ? `${anoEgreso} – ` : ''}Presente`,
          nota: notaStr || 'Tercio Superior',
        },
      ],
      experiencias: expExtras.length > 0 ? expExtras : [
        {
          cargo: 'Desarrolladora Frontend Junior',
          empresa: 'Tech Solutions Perú',
          periodo: 'Ene 2024 - Presente',
          descripcion: 'Desarrollo de interfaces de usuario interactivas con React y TypeScript.\\nColaboración con el equipo de diseño para implementar sistemas de diseño.\\nOptimización del rendimiento web logrando una reducción del 30% en el tiempo de carga.',
          esMúltiples: true,
        },
        {
          cargo: 'Voluntaria en Tecnología',
          empresa: 'Comunidad STEM',
          periodo: 'Mar 2023 - Dic 2023',
          descripcion: 'Enseñanza de fundamentos de programación a niños de secundaria.\\nOrganización de hackathones y talleres educativos.',
          esMúltiples: false,
        }
      ],
      habilidades: [
        { categoria: 'Idiomas', items: idiomasArr.length > 1 ? idiomasArr.join(', ') : 'Español (Nativo), Inglés (Avanzado - C1 Cambridge)' },
        { categoria: 'Tecnologías', items: 'React, TypeScript, Node.js, Python, PostgreSQL, Git' },
        { categoria: 'Soft Skills', items: 'Liderazgo, Trabajo en equipo, Comunicación asertiva, Resolución de problemas' }
      ],
      proyectos: [
        {
          nombre: 'Pathfinder: Portal de Becas',
          descripcion: 'Desarrollo de una plataforma web para facilitar la búsqueda de becas a estudiantes peruanos. Integración con Supabase y diseño de interfaz intuitiva.',
          link: 'github.com/maria/pathfinder'
        }
      ]
    }));
  }, [profile]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateField = <K extends keyof CVFormData>(key: K, val: CVFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  function updateArrayItem<T>(
    key: 'experiencias' | 'educacion' | 'proyectos' | 'habilidades',
    idx: number,
    field: keyof T,
    val: string | boolean,
  ) {
    setForm(prev => {
      const arr = [...(prev[key] as T[])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, [key]: arr };
    });
  }

  function addArrayItem<T>(key: 'experiencias' | 'educacion' | 'proyectos' | 'habilidades', empty: T) {
    setForm(prev => ({ ...prev, [key]: [...(prev[key] as T[]), { ...empty }] }));
  }

  function removeArrayItem(key: 'experiencias' | 'educacion' | 'proyectos' | 'habilidades', idx: number) {
    setForm(prev => ({ ...prev, [key]: (prev[key] as unknown[]).filter((_, i) => i !== idx) }));
  }

  // ── Generate with AI ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setLatexCode('');

    // Set local HTML instantly so the panel always shows a CV preview
    setHtmlCode(buildLocalCVHtml(form));

    try {
      const prompt = buildLatexPrompt(form);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT_LATEX },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) throw new Error(`Error de API: ${response.status}`);

      const data = await response.json() as { choices: { message: { content: string } }[] };
      const content = data.choices[0].message.content;

      const separator = '===HTML_START===';
      const sepIdx = content.indexOf(separator);

      if (sepIdx !== -1) {
        setLatexCode(content.slice(0, sepIdx).trim());
        setHtmlCode(content.slice(sepIdx + separator.length).trim());
      } else {
        setLatexCode(content.trim());
        // Keep local HTML (already set above) as the preview
      }
      // Auto-switch panel to HTML tab
      setForceHtmlTab(true);
      setTimeout(() => setForceHtmlTab(false), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al generar el CV.');
      // Local HTML stays visible — no need for fallback
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex-1 bg-bg-base px-6 md:px-10 pb-6 md:pb-10 flex flex-col gap-8 font-sans animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-12 h-12 bg-main border-2 border-border rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px] text-main-foreground">description</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] md:text-[32px] font-black text-foreground leading-tight">
                Genera tu CV
              </h1>
              <Badge>NUEVO</Badge>
            </div>
            <p className="text-[14px] font-bold text-muted-foreground">
              Completa el formulario y la IA generará tu CV profesional en LaTeX y HTML.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-col gap-6">
        
        <Sheet>
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white border-2 border-border p-4 rounded-2xl shadow-shadow">
            <div className="flex flex-col">
              <span className="font-black text-[16px] text-text-primary">Contenido del CV</span>
              <span className="font-bold text-[12px] text-text-secondary">Actualiza tus datos para generar un nuevo PDF.</span>
            </div>
            <SheetTrigger asChild>
              <Button className="bg-brand-coral border-2 border-border text-white shadow-shadow hover:-translate-y-0.5 hover:bg-brand-coral/90 active:translate-y-0 active:shadow-none text-[13px] font-black h-11 px-6">
                <span className="material-symbols-outlined text-[18px]">edit_document</span>
                Editar Datos
              </Button>
            </SheetTrigger>
          </div>

          {/* ── Preview Full Width ── */}
          <div className="w-full h-[calc(100vh-280px)] min-h-[600px]">
            <CVPreviewPanel
              latexCode={latexCode}
              htmlCode={htmlCode}
              isGenerating={isGenerating}
              forceHtmlTab={forceHtmlTab}
            />
          </div>

          {/* ── Right Drawer: Form ── */}
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-bg-base border-l-2 border-border p-6 md:p-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-black text-text-primary">Datos del CV</SheetTitle>
              <SheetDescription className="font-bold text-text-secondary text-[13px]">
                Modifica tu información y genera el CV con IA cuando estés listo.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 min-w-0 pb-10">
              <Accordion type="multiple" defaultValue={["personales", "experiencia", "educacion", "proyectos", "habilidades"]} className="flex flex-col gap-4">
                {/* Datos Personales */}
                <AccordionItem value="personales" className="border-2 border-border rounded-xl bg-white overflow-hidden shadow-shadow data-[state=open]:shadow-shadow">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 text-left">
                      <span className="material-symbols-outlined text-[20px] text-brand-blue">person</span>
                      <div>
                        <div className="text-[14px] font-black text-text-primary">Datos Personales</div>
                        <div className="text-[11px] text-text-secondary font-bold mt-0.5">Esta info pre-llenada viene de tu perfil</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-5 border-t-2 border-border flex flex-col gap-4 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Nombre Completo</label>
                        <Input value={form.nombreCompleto} onChange={e => updateField('nombreCompleto', e.target.value)} placeholder="Ej: María Fernanda Torres" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Correo Electrónico</label>
                        <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="tucorreo@mail.com" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Teléfono</label>
                        <Input value={form.telefono} onChange={e => updateField('telefono', e.target.value)} placeholder="+51 999 999 999" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1">
                          LinkedIn URL <span className="text-slate-400 font-bold normal-case tracking-normal">(opcional)</span>
                        </label>
                        <Input value={form.linkedin || ''} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/usuario" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1">
                          Usuario LinkedIn <span className="text-slate-400 font-bold normal-case tracking-normal">(opcional)</span>
                        </label>
                        <Input value={form.linkedinUsuario || ''} onChange={e => updateField('linkedinUsuario', e.target.value)} placeholder="usuario" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1">
                          GitHub / Portfolio <span className="text-slate-400 font-bold normal-case tracking-normal">(opcional)</span>
                        </label>
                        <Input value={form.github || ''} onChange={e => updateField('github', e.target.value)} placeholder="github.com/usuario" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Resumen Profesional</label>
                      <Textarea
                        value={form.resumen}
                        onChange={e => updateField('resumen', e.target.value)}
                        placeholder="Soy estudiante de Ingeniería con 2 años de experiencia en proyectos de software, apasionado por la IA y el impacto social..."
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Experiencia */}
                <AccordionItem value="experiencia" className="border-2 border-border rounded-xl bg-white overflow-hidden shadow-shadow data-[state=open]:shadow-shadow">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 text-left w-full pr-4">
                      <span className="material-symbols-outlined text-[20px] text-brand-blue">work</span>
                      <div className="flex-1">
                        <div className="text-[14px] font-black text-text-primary">Experiencia y Proyectos</div>
                        <div className="text-[11px] text-text-secondary font-bold mt-0.5">Trabajos, voluntariados o proyectos escolares</div>
                      </div>
                      <Button variant="neutral" size="sm" onClick={(e) => { e.stopPropagation(); addArrayItem('experiencias', EMPTY_EXPERIENCIA); }} className="h-8 shadow-none border-2">
                        <span className="material-symbols-outlined text-[14px]">add</span> Añadir
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-5 border-t-2 border-border flex flex-col gap-4 bg-white">
                    {form.experiencias.map((exp, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl relative">
                        {form.experiencias.length > 1 && (
                          <button onClick={() => removeArrayItem('experiencias', idx)} className="absolute top-3 right-3 text-slate-400 hover:text-danger-text transition-colors">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Cargo / Rol</label>
                            <Input value={exp.cargo} onChange={e => updateArrayItem<ExperienciaItem>('experiencias', idx, 'cargo', e.target.value)} placeholder="Practicante de Desarrollo" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Empresa / Organización</label>
                            <Input value={exp.empresa} onChange={e => updateArrayItem<ExperienciaItem>('experiencias', idx, 'empresa', e.target.value)} placeholder="Empresa SAC" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Período</label>
                            <Input value={exp.periodo} onChange={e => updateArrayItem<ExperienciaItem>('experiencias', idx, 'periodo', e.target.value)} placeholder="Ene 2024 - Jun 2024" />
                          </div>
                          <div className="flex flex-col gap-1.5 justify-end">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Tipo</label>
                            <RadioGroup
                              value={String(exp.esMúltiples)}
                              onValueChange={v => updateArrayItem<ExperienciaItem>('experiencias', idx, 'esMúltiples', v === 'true')}
                              className="flex gap-3"
                            >
                              <div className="flex items-center gap-1.5">
                                <RadioGroupItem value="false" id={`exp-type-${idx}-false`} />
                                <label htmlFor={`exp-type-${idx}-false`} className="text-[12px] font-bold text-slate-600 cursor-pointer">Resumen corto</label>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <RadioGroupItem value="true" id={`exp-type-${idx}-true`} />
                                <label htmlFor={`exp-type-${idx}-true`} className="text-[12px] font-bold text-slate-600 cursor-pointer">Con puntos (bullets)</label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">{exp.esMúltiples ? "Logros / Responsabilidades (un punto por línea)" : "Descripción breve"}</label>
                          <Textarea
                            value={exp.descripcion}
                            onChange={e => updateArrayItem<ExperienciaItem>('experiencias', idx, 'descripcion', e.target.value)}
                            placeholder={exp.esMúltiples ? "Desarrollé una app de gestión...\nReduje el tiempo de procesamiento en 30%..." : "Apoyé en el desarrollo de soluciones web para clientes del sector retail..."}
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Educación */}
                <AccordionItem value="educacion" className="border-2 border-border rounded-xl bg-white overflow-hidden shadow-shadow data-[state=open]:shadow-shadow">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 text-left w-full pr-4">
                      <span className="material-symbols-outlined text-[20px] text-brand-blue">school</span>
                      <div className="flex-1">
                        <div className="text-[14px] font-black text-text-primary">Educación</div>
                        <div className="text-[11px] text-text-secondary font-bold mt-0.5">Añade tu colegio, instituto o universidad</div>
                      </div>
                      <Button variant="neutral" size="sm" onClick={(e) => { e.stopPropagation(); addArrayItem('educacion', EMPTY_EDUCACION); }} className="h-8 shadow-none border-2">
                        <span className="material-symbols-outlined text-[14px]">add</span> Añadir
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-5 border-t-2 border-border flex flex-col gap-4 bg-white">
                    {form.educacion.map((edu, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl relative">
                        {form.educacion.length > 1 && (
                          <button onClick={() => removeArrayItem('educacion', idx)} className="absolute top-3 right-3 text-slate-400 hover:text-danger-text">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Grado / Título</label>
                            <Input value={edu.grado} onChange={e => updateArrayItem<EducacionItem>('educacion', idx, 'grado', e.target.value)} placeholder="Bachiller en Ing. de Sistemas" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Institución</label>
                            <Input value={edu.institucion} onChange={e => updateArrayItem<EducacionItem>('educacion', idx, 'institucion', e.target.value)} placeholder="PUCP" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Período</label>
                            <Input value={edu.periodo} onChange={e => updateArrayItem<EducacionItem>('educacion', idx, 'periodo', e.target.value)} placeholder="2020 - 2025" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1">
                              Nota / GPA <span className="text-slate-400 font-bold normal-case tracking-normal">(opcional)</span>
                            </label>
                            <Input value={edu.nota || ''} onChange={e => updateArrayItem<EducacionItem>('educacion', idx, 'nota', e.target.value)} placeholder="Promedio 15.8/20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Proyectos */}
                <AccordionItem value="proyectos" className="border-2 border-border rounded-xl bg-white overflow-hidden shadow-shadow data-[state=open]:shadow-shadow">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 text-left w-full pr-4">
                      <span className="material-symbols-outlined text-[20px] text-brand-blue">rocket_launch</span>
                      <div className="flex-1">
                        <div className="text-[14px] font-black text-text-primary">Proyectos</div>
                        <div className="text-[11px] text-text-secondary font-bold mt-0.5">Proyectos personales, universitarios o de código abierto</div>
                      </div>
                      <Button variant="neutral" size="sm" onClick={(e) => { e.stopPropagation(); addArrayItem('proyectos', EMPTY_PROYECTO); }} className="h-8 shadow-none border-2">
                        <span className="material-symbols-outlined text-[14px]">add</span> Añadir
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-5 border-t-2 border-border flex flex-col gap-4 bg-white">
                    {form.proyectos.map((proj, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl relative">
                        {form.proyectos.length > 1 && (
                          <button onClick={() => removeArrayItem('proyectos', idx)} className="absolute top-3 right-3 text-slate-400 hover:text-danger-text">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Nombre del Proyecto</label>
                            <Input value={proj.nombre} onChange={e => updateArrayItem<ProyectoItem>('proyectos', idx, 'nombre', e.target.value)} placeholder="Ej: Pathfinder App" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1">
                              Link / Demo <span className="text-slate-400 font-bold normal-case tracking-normal">(opcional)</span>
                            </label>
                            <Input value={proj.link || ''} onChange={e => updateArrayItem<ProyectoItem>('proyectos', idx, 'link', e.target.value)} placeholder="https://github.com/..." />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Descripción</label>
                          <Textarea
                            value={proj.descripcion}
                            onChange={e => updateArrayItem<ProyectoItem>('proyectos', idx, 'descripcion', e.target.value)}
                            placeholder="Plataforma web de gestión de becas para postulantes peruanos, construida con React y Supabase..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Habilidades */}
                <AccordionItem value="habilidades" className="border-2 border-border rounded-xl bg-white overflow-hidden shadow-shadow data-[state=open]:shadow-shadow">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 text-left w-full pr-4">
                      <span className="material-symbols-outlined text-[20px] text-brand-blue">psychology</span>
                      <div className="flex-1">
                        <div className="text-[14px] font-black text-text-primary">Habilidades</div>
                        <div className="text-[11px] text-text-secondary font-bold mt-0.5">Idiomas, tecnologías, herramientas</div>
                      </div>
                      <Button variant="neutral" size="sm" onClick={(e) => { e.stopPropagation(); addArrayItem('habilidades', EMPTY_HABILIDAD); }} className="h-8 shadow-none border-2">
                        <span className="material-symbols-outlined text-[14px]">add</span> Añadir
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-5 border-t-2 border-border flex flex-col gap-4 bg-white">
                    {form.habilidades.map((hab, idx) => (
                      <div key={idx} className="grid grid-cols-[140px_1fr_auto] gap-3 items-start">
                        <div className="flex flex-col gap-1.5">
                          {idx === 0 && <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Categoría</label>}
                          <Input value={hab.categoria} onChange={e => updateArrayItem<HabilidadItem>('habilidades', idx, 'categoria', e.target.value)} placeholder="Idiomas" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {idx === 0 && <label className="text-[11px] font-black text-text-primary uppercase tracking-wider">Habilidades (separadas por coma)</label>}
                          <Input value={hab.items} onChange={e => updateArrayItem<HabilidadItem>('habilidades', idx, 'items', e.target.value)} placeholder="Python, React, Git" />
                        </div>
                        {form.habilidades.length > 1 && (
                          <button onClick={() => removeArrayItem('habilidades', idx)} className={`text-slate-400 hover:text-danger-text ${idx === 0 ? 'mt-7' : ''}`}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

          {/* Error */}
          {error && (
            <Card className="bg-white border-danger-text flex flex-row items-start gap-3 p-4 shadow-none">
              <span className="material-symbols-outlined text-[20px] text-danger-text shrink-0">error</span>
              <p className="text-[13px] font-bold text-danger-text">{error}</p>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !form.nombreCompleto || !form.email}
            className="w-full h-16 text-lg font-black"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">refresh</span>
                Generando tu CV...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                Generar CV con IA
              </>
            )}
          </Button>
            </div>

            </SheetContent>
          </Sheet>
        </div>
      </div>
  );
}
