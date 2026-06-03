import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

function StatusBadge({ estado }: { estado: string }) {
  if (["Validado", "Listo", "Aprobado"].includes(estado)) {
    return (
      <span className="s-ok font-medium">
        <span
          className="material-symbols-outlined text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        Validado
      </span>
    );
  }
  if (estado === "Rechazado") {
    return (
      <span className="s-err font-medium">
        <span className="material-symbols-outlined text-[14px]">
          cancel
        </span>
        Rechazado
      </span>
    );
  }
  return (
    <span className="s-warn font-medium">
      <span className="material-symbols-outlined text-[14px]">
        hourglass_empty
      </span>
      En revisión
    </span>
  );
}



const baseDocs = [
  {
    id: 1,
    name: "DNI Postulante",
    fileText: "PDF • Requerido",
    documentIcon: "description",
    documentIconColor: "text-muted-slate",
    description: "Copia legible por ambos lados.",
    status: {
      estado: "Pendiente",
      badgeClass: "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded"
    },
    actionType: "button",
    actionText: "Subir",
    actionClass: "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors",
    es_requerido: true,
    category: "Identidad"
  },
  {
    id: 2,
    name: "Certificado de Estudios",
    fileText: "Requerido",
    documentIcon: "school",
    documentIconColor: "text-muted-slate",
    description: "Certificado oficial de 1ero a 5to de secundaria.",
    status: {
      estado: "Pendiente",
      badgeClass: "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded"
    },
    actionType: "button",
    actionText: "Subir",
    actionClass: "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors",
    es_requerido: true,
    category: "Académicos"
  }
];

const becasDocsFallback: Record<string, any[]> = {
  'BEC-01': [
    { id: 1, name: "DNI Postulante", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad" },
    { id: 2, name: "Certificado de Estudios", fileText: "Requerido", documentIcon: "school", documentIconColor: "text-muted-slate", description: "Certificado oficial de 1ero a 5to de secundaria.", es_requerido: true, category: "Académicos" },
    { id: 3, name: "Ficha SISFOH", fileText: "PDF • Requerido", documentIcon: "account_balance", documentIconColor: "text-muted-slate", description: "Documento de clasificación socioeconómica vigente.", es_requerido: true, category: "Socioeconómicos" }
  ],
  'BEC-02': [
    { id: 1, name: "DNI Postulante", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad" },
    { id: 2, name: "Certificado de Estudios", fileText: "Requerido", documentIcon: "school", documentIconColor: "text-muted-slate", description: "Certificado oficial de 1ero a 5to de secundaria.", es_requerido: true, category: "Académicos" },
    { id: 11, name: "Constancia Tercio", fileText: "PDF • Requerido", documentIcon: "workspace_premium", documentIconColor: "text-muted-slate", description: "Constancia de pertenecer al tercio superior.", es_requerido: true, category: "Académicos" }
  ],
  'BEC-03': [
    { id: 1, name: "DNI Postulante", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad" },
    { id: 10, name: "DNI Apoderado", fileText: "PDF • Requerido", documentIcon: "badge", documentIconColor: "text-muted-slate", description: "Copia del DNI del padre o tutor.", es_requerido: true, category: "Identidad" },
    { id: 2, name: "Certificado de Estudios", fileText: "Requerido", documentIcon: "school", documentIconColor: "text-muted-slate", description: "Certificado oficial de 1ero a 5to de secundaria.", es_requerido: true, category: "Académicos" },
    { id: 11, name: "Constancia Tercio", fileText: "PDF • Requerido", documentIcon: "workspace_premium", documentIconColor: "text-muted-slate", description: "Constancia de pertenecer al tercio superior.", es_requerido: true, category: "Académicos" },
    { id: 3, name: "Ficha SISFOH", fileText: "PDF • Requerido", documentIcon: "account_balance", documentIconColor: "text-muted-slate", description: "Documento de clasificación socioeconómica vigente.", es_requerido: true, category: "Socioeconómicos" },
    { id: 12, name: "Decl. Juradas", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Declaraciones juradas requeridas.", es_requerido: true, category: "Socioeconómicos" }
  ],
  'BEC-04': [
    { id: 1, name: "DNI Postulante", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad" },
    { id: 2, name: "Certificado de Estudios", fileText: "Requerido", documentIcon: "school", documentIconColor: "text-muted-slate", description: "Certificado oficial de 1ero a 5to de secundaria.", es_requerido: true, category: "Académicos" },
    { id: 11, name: "Constancia Tercio", fileText: "PDF • Requerido", documentIcon: "workspace_premium", documentIconColor: "text-muted-slate", description: "Constancia de pertenecer al tercio superior.", es_requerido: true, category: "Académicos" }
  ]
};

function getFallbackDocsForBeca(beca: any) {
  if (!beca) return baseDocs;
  if (becasDocsFallback[beca.id]) {
    return becasDocsFallback[beca.id];
  }
  
  const list = [
    { id: 1, name: "DNI Postulante", fileText: "PDF • Requerido", documentIcon: "description", documentIconColor: "text-muted-slate", description: "Copia legible por ambos lados.", es_requerido: true, category: "Identidad" },
    { id: 2, name: "Certificado de Estudios", fileText: "Requerido", documentIcon: "school", documentIconColor: "text-muted-slate", description: "Certificado oficial de 1ero a 5to de secundaria.", es_requerido: true, category: "Académicos" }
  ];
  
  const reqStr = (beca.requirement || "").toLowerCase();
  
  if (reqStr.includes("sisfoh") || reqStr.includes("pobre") || reqStr.includes("vulnerabilidad") || reqStr.includes("recursos")) {
    list.push({ id: 3, name: "Ficha SISFOH", fileText: "PDF • Requerido", documentIcon: "account_balance", documentIconColor: "text-muted-slate", description: "Documento de clasificación socioeconómica vigente.", es_requerido: true, category: "Socioeconómicos" });
  }
  
  if (reqStr.includes("tercio") || reqStr.includes("quinto") || reqStr.includes("primeros") || reqStr.includes("excelencia") || reqStr.includes("promedio 16") || reqStr.includes("nota mínima 16") || reqStr.includes("nota mínima 15")) {
    list.push({ id: 11, name: "Constancia Tercio", fileText: "PDF • Requerido", documentIcon: "workspace_premium", documentIconColor: "text-muted-slate", description: "Constancia de pertenecer al tercio superior.", es_requerido: true, category: "Académicos" });
  }

  if (reqStr.includes("apoderado") || reqStr.includes("hijo") || reqStr.includes("menor") || reqStr.includes("padre")) {
    list.push({ id: 10, name: "DNI Apoderado", fileText: "PDF • Requerido", documentIcon: "badge", documentIconColor: "text-muted-slate", description: "Copia del DNI del padre o tutor.", es_requerido: true, category: "Identidad" });
  }
  
  return list;
}

export default function Documentos() {
  const { user } = useAuth();
  const [dbDocs, setDbDocs] = useState<any[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);

  const [tab, setTab] = useState<"disponibles" | "obtenidas">("disponibles");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [selectedBecaId, setSelectedBecaId] = useState<string>(() => {
    return localStorage.getItem("pathfinder_active_meta") || "";
  });

  const [appliedBecaIds, setAppliedBecaIds] = useState<string[]>([]);

  const selectedBeca = becas.find((b) => b.id === selectedBecaId);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
          return;
        }
        const [becasRes, cursosRes] = await Promise.all([
          supabase.from("becas").select("*").order("id", { ascending: true }),
          supabase.from("cursos_capacitacion").select("*").order("id", { ascending: true })
        ]);
        if (becasRes.data) {
          setBecas(becasRes.data.map((row: any) => ({
            id: row.id,
            title: row.titulo,
            sponsor: row.sponsor,
            coverage: row.cobertura,
            requirement: row.requisitos,
            deadline: row.fecha_cierre,
            level: row.nivel,
            icon: row.icono || "school",
            sobre: row.sobre || "",
            beneficios: Array.isArray(row.beneficios) ? row.beneficios : [],
            affinity: row.afinidad ?? row.affinity ?? null,
            documentos_requeridos: Array.isArray(row.documentos_requeridos) ? row.documentos_requeridos : []
          })));
        }
        if (user) {
          const { data: posts } = await supabase
            .from("postulaciones")
            .select("beca_id")
            .eq("usuario_id", user.id);
          if (posts && posts.length > 0) {
            setAppliedBecaIds(posts.map((p: any) => p.beca_id));
          }
        }
        if (cursosRes.data) {
          setCursos(cursosRes.data.map((row: any) => ({
            id: row.id,
            title: row.titulo,
            sponsor: row.sponsor,
            duration: row.duracion,
            requirement: row.requisitos,
            status: row.estado
          })));
        }
      } catch (err) {
        console.error("Error fetching catalog data in Documentos:", err);
      }
    };
    fetchCatalogData();
  }, [user]);

  const fetchDbDocuments = async () => {
    if (!user) return;
    try {
      if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
        return;
      }

      if (!selectedBecaId) {
        setDbDocs([]);
        return;
      }

      let { data: post, error: postErr } = await supabase
        .from("postulaciones")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("beca_id", selectedBecaId)
        .maybeSingle();

      if (!post && !postErr) {
        const { data: newPost, error: createErr } = await supabase
          .from("postulaciones")
          .insert({
            usuario_id: user.id,
            beca_id: selectedBecaId,
            paso_pipeline: 1,
            estado_general: "En Preparación"
          })
          .select("id")
          .single();

        if (createErr) throw createErr;
        post = newPost;
      }

      if (post) {
        const { data: docs, error: docsErr } = await supabase
          .from("documentos")
          .select("*")
          .eq("postulacion_id", post.id);

        if (docsErr) throw docsErr;
        setDbDocs(docs || []);
      }
    } catch (err) {
      console.error("Error syncing documents with Supabase:", err);
    }
  };

  useEffect(() => {
    fetchDbDocuments();
  }, [user, selectedBecaId]);

  const handleBecaChange = (id: string) => {
    setSelectedBecaId(id);
    if (id) {
      localStorage.setItem("pathfinder_active_meta", id);
    } else {
      removeItem();
    }
  };

  const removeItem = () => {
    localStorage.removeItem("pathfinder_active_meta");
  };

  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>(() => {
    const storedDocs = localStorage.getItem("pathfinder_uploaded_docs");
    if (storedDocs) {
      try {
        return JSON.parse(storedDocs);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    const storedCourses = localStorage.getItem("pathfinder_enrolled_courses");
    if (storedCourses) {
      try {
        return JSON.parse(storedCourses);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocToUpload, setSelectedDocToUpload] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEnroll = (courseId: string, courseTitle: string) => {
    if (enrolledCourseIds.includes(courseId)) {
      const certDocId = `CERT-${courseId}`;
      if (uploadedDocIds.includes(certDocId)) {
        setToastMessage("Ya has descargado el certificado de este curso.");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        return;
      }

      const newDocs = [...uploadedDocIds, certDocId];
      setUploadedDocIds(newDocs);
      localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(newDocs));
      setToastMessage(`¡Certificado digital oficial generado para: "${courseTitle}"! Se agregó a tu Mochila de Documentos.`);
    } else {
      const updated = [...enrolledCourseIds, courseId];
      setEnrolledCourseIds(updated);
      localStorage.setItem("pathfinder_enrolled_courses", JSON.stringify(updated));
      setToastMessage(`¡Te has matriculado con éxito en: "${courseTitle}"! Empieza tus lecciones en línea.`);
    }
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const startUploadSim = (docId: string) => {
    setSelectedDocToUpload(docId);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const docMeta = getDetailedDocuments().find((d) => String(d.id) === selectedDocToUpload);
    const docName = docMeta ? docMeta.name : "Documento";

    if (user && selectedFile) {
      try {
        if (!selectedBecaId) {
          throw new Error("Por favor selecciona una beca/meta activa en la parte superior para vincular este documento.");
        }

        const { data: post } = await supabase
          .from("postulaciones")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("beca_id", selectedBecaId)
          .single();

        if (!post) throw new Error("No se encontró una postulación activa.");

        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/${post.id}/${selectedDocToUpload}_${Date.now()}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from("expedientes")
          .upload(filePath, selectedFile, { cacheControl: "3600", upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from("expedientes")
          .getPublicUrl(filePath);

        await supabase
          .from("documentos")
          .delete()
          .eq("postulacion_id", post.id)
          .eq("nombre_documento", docName);

        const { error: dbErr } = await supabase
          .from("documentos")
          .insert({
            postulacion_id: post.id,
            nombre_documento: docName,
            estado: "Validado",
            archivo_url: publicUrl,
            texto_ayuda: "Documento subido exitosamente a Supabase Storage."
          });

        if (dbErr) throw dbErr;

        await fetchDbDocuments();

        const updated = [...uploadedDocIds, selectedDocToUpload];
        setUploadedDocIds(updated);
        localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(updated));

        setToastMessage(`¡Archivo "${selectedFile.name}" subido con éxito en Supabase!`);
      } catch (err: any) {
        console.error("Error uploading document to Supabase:", err);
        setToastMessage(`Error al subir: ${err.message || "Fallo de conexión."}`);
      } finally {
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
      return;
    }

    setTimeout(() => {
      const updated = [...uploadedDocIds, selectedDocToUpload];
      setUploadedDocIds(updated);
      localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(updated));

      setIsUploading(false);
      setIsUploadModalOpen(false);

      setToastMessage(`¡Archivo subido con éxito! El Asesor IA validó la firma digital.`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 1500);
  };

  const handleSimulatedDownload = (docName: string, archiveUrl?: string) => {
    if (archiveUrl) {
      window.open(archiveUrl, "_blank");
      return;
    }
    setToastMessage(`Descargando copia local de: "${docName}"...`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getDetailedDocuments = () => {
    let rawDocs = baseDocs;
    if (selectedBeca) {
      if (Array.isArray(selectedBeca.documentos_requeridos) && selectedBeca.documentos_requeridos.length > 0) {
        rawDocs = selectedBeca.documentos_requeridos;
      } else {
        rawDocs = getFallbackDocsForBeca(selectedBeca);
      }
    }

    const list: any[] = rawDocs.map((doc: any) => {
      const stringId = String(doc.id);
      
      const dbDoc = dbDocs.find((d) => d.nombre_documento === doc.name);
      if (dbDoc) {
        return {
          ...doc,
          fileText: "PDF • Cargado en Supabase",
          fileTextColor: "text-tertiary",
          documentIcon: "check_circle",
          documentIconColor: "text-tertiary",
          status: {
            estado: dbDoc.estado || "Validado",
            color: dbDoc.estado === "Rechazado" ? "text-error" : "text-tertiary",
            icon: dbDoc.estado === "Rechazado" ? "warning" : "check_circle",
            badgeClass: dbDoc.estado === "Rechazado" ? "bg-error-container text-on-error-container font-body-bold text-[12px] rounded" : "",
          },
          actionType: "options",
          archivo_url: dbDoc.archivo_url,
          es_requerido: doc.es_requerido,
        };
      }

      const isUploadedSimulated = 
        uploadedDocIds.includes(stringId) || 
        (doc.name === "Certificado de Estudios" && uploadedDocIds.includes("2")) ||
        (doc.name === "DNI Apoderado" && uploadedDocIds.includes("DNI-APO")) ||
        (doc.name === "Ficha SISFOH" && uploadedDocIds.includes("3")) ||
        (doc.name === "Decl. Juradas" && uploadedDocIds.includes("DECL")) ||
        (doc.name === "Examen Aptitud" && uploadedDocIds.includes("50")) ||
        (doc.name === "Aptitud Especial" && uploadedDocIds.includes("60"));

      if (isUploadedSimulated) {
        return {
          ...doc,
          fileText: "PDF • Cargado hace un momento (Simulado)",
          fileTextColor: "text-tertiary",
          documentIcon: "check_circle",
          documentIconColor: "text-tertiary",
          status: {
            estado: "Validado",
            color: "text-tertiary",
            icon: "check_circle",
            badgeClass: "",
          },
          actionType: "options",
        };
      }

      return {
        ...doc,
        fileText: doc.fileText || "PDF • Requerido",
        documentIcon: doc.documentIcon || "description",
        documentIconColor: "text-muted-slate",
        status: {
          estado: "Pendiente",
          badgeClass: "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded",
        },
        actionType: "button",
        actionText: "Subir",
        actionClass: "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors",
      };
    });

    return list;
  };

  const getCategories = () => {
    const catMap = new Map();
    const docs = getDetailedDocuments();
    
    docs.filter(d => d.es_requerido).forEach(doc => {
      const catName = doc.category || "Otros";
      if (!catMap.has(catName)) {
        catMap.set(catName, {
          title: catName,
          icon: catName === "Identidad" ? "badge" : catName === "Académicos" ? "school" : catName === "Socioeconómicos" ? "account_balance" : "folder",
          hasError: false,
          items: []
        });
      }
      const cat = catMap.get(catName);
      cat.items.push({
        id: doc.id,
        name: doc.name,
        status: doc.status.estado === "Validado" ? "LISTO" : doc.status.estado === "Rechazado" ? "Reemplazar" : "PENDIENTE"
      });
      if (doc.status.estado === "Rechazado") {
        cat.hasError = true;
      }
    });
    
    return Array.from(catMap.values());
  };

  const currentCategories = getCategories();
  const currentDocs = getDetailedDocuments();

  // FIX #2: "Rechazado" does NOT count as ready
  const docsListos = currentDocs.filter(d =>
    d.status.estado === "Validado" || d.status.estado === "Listo" || d.status.estado === "Aprobado"
  ).length;
  const totalCount = currentDocs.length;
  const currentPercentage = totalCount > 0 ? Math.round((docsListos / totalCount) * 100) : 0;

  // FIX #5: Clock color based on real urgency
  const fechaCierre = selectedBeca?.deadline;
  const diasRestantes = fechaCierre
    ? Math.floor((new Date(fechaCierre).getTime() - Date.now()) / 86400000)
    : null;
  const colorReloj =
    diasRestantes === null ? "text-muted-slate" :
    diasRestantes <= 7 ? "text-red-500" :
    diasRestantes <= 30 ? "text-amber-500" :
    "text-green-600";

  // FIX #4: Format date in Spanish
  const fechaFormateada = fechaCierre
    ? new Date(fechaCierre).toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // FIX #14: Tab filter for capacitaciones
  const capacitacionesConEstado = cursos.map(c => ({
    ...c,
    enMochila: uploadedDocIds.includes(`CERT-${c.id}`),
    isEnrolled: enrolledCourseIds.includes(c.id),
  }));
  const disponibles = capacitacionesConEstado.filter(c => !c.enMochila);
  const obtenidas = capacitacionesConEstado.filter(c => c.enMochila);
  const listaCapacitaciones = tab === "disponibles" ? disponibles : obtenidas;


  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar pb-16">
      <div className="max-w-6xl mx-auto px-md md:px-margin-desktop py-xl space-y-xl w-full">
        {/* HEADER */}
        <header className="flex flex-col gap-1">
          <h1 className="t-lg bold">
            Mochila de Documentos
          </h1>
          <p className="t-sm mt-1">
            Organiza y gestiona todos tus certificados necesarios para tus postulaciones en un solo lugar.
          </p>
        </header>

        {/* Meta Selector Section */}
        <section className="card flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-xl font-fill">target</span>
              <h3 className="t-base bold">
                Beca / Meta de Postulación Vinculada
              </h3>
            </div>
            <p className="t-xs leading-normal">
              Conecta tu Mochila a una de tus metas de becas activas para que el Asesor IA adapte tus requisitos automáticamente.
            </p>
          </div>

          <div className="w-full md:w-80 shrink-0">
            {/* FIX #3: Show only beca.title, no internal ID */}
            <select
              value={selectedBecaId}
              onChange={(e) => handleBecaChange(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[12px] p-2 t-base outline-none cursor-pointer"
            >
              <option value="">Ninguna (Mochila General)</option>
              {appliedBecaIds.map((id) => {
                const beca = becas.find((b) => b.id === id);
                if (!beca) return null;
                return (
                  <option key={beca.id} value={beca.id} title={beca.title}>
                    {beca.title}
                  </option>
                );
              })}
            </select>
          </div>
        </section>

        {/* Selected Beca Details Badge Card */}
        {selectedBeca && (
          <div className="bg-[#e8eef8] border border-[#e2e8f0] p-4 rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-navy-2 shrink-0">
                <span className="material-symbols-outlined text-xl font-fill">{selectedBeca.icon || "school"}</span>
              </div>
              <div>
                {/* FIX #7: "Expediente requerido" — sentence case, no uppercase */}
                <p className="t-label">
                  Expediente requerido
                </p>
                <h4 className="t-base bold leading-tight mt-0.5">
                  {selectedBeca.title}
                </h4>
                <p className="t-xs mt-0.5">
                  Organizado por <span className="bold">{selectedBeca.sponsor}</span> • Requisito: <span className="bold">{selectedBeca.requirement}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-md self-start sm:self-center">
              <div className="text-left sm:text-right">
                <p className="t-label">Cierre de Convocatoria</p>
                {/* FIX #4 + FIX #5: Formatted date + dynamic clock color */}
                <p className={`t-sm font-medium mt-0.5 flex items-center gap-1 ${colorReloj}`}>
                  <span className="material-symbols-outlined text-sm">alarm</span>
                  {fechaFormateada
                    ? diasRestantes !== null && diasRestantes > 0
                      ? `Cierra el ${fechaFormateada} (${diasRestantes} días)`
                      : `Cerró el ${fechaFormateada}`
                    : "—"}
                </p>
              </div>
              {/* FIX #1: Only show affinity badge if value is truthy */}
              {selectedBeca.affinity ? (
                <div className="badge b-blue font-medium text-xs whitespace-nowrap">
                  {selectedBeca.affinity}% afinidad
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* PROGRESS & ALERT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 card flex flex-col justify-center">
            <div className="flex justify-between items-end mb-sm">
              <div>
                <p className="t-label">
                  Progreso del Expediente
                </p>
                <p className="t-lg bold">
                  {currentPercentage}%
                </p>
              </div>
              <p className="t-sm">
                {docsListos} de {totalCount} documentos listos
              </p>
            </div>
            {currentPercentage === 0 ? (
              <p className="t-xs mt-1">
                Sube tu primer documento para comenzar
              </p>
            ) : (
              <div className="prog-track">
                <div
                  className="prog-fill transition-all duration-700"
                  style={{ width: `${currentPercentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Alerta condicional: solo si hay documentos rechazados */}
          {(() => {
            const rechazados = currentDocs.filter(d => d.status.estado === "Rechazado");
            if (rechazados.length === 0) return null;
            return (
              <div className="card b-red flex items-start gap-md border border-red">
                <div className="w-8 h-8 bg-red text-white rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <div>
                  <p className="t-sm bold text-red">Atención inmediata</p>
                  <p className="t-xs text-red mt-1 leading-normal">
                    {rechazados.length === 1
                      ? `"${rechazados[0].name}" fue rechazado. Reemplázalo para no perder elegibilidad.`
                      : `Tienes ${rechazados.length} documentos rechazados. Revísalos para no perder elegibilidad.`}
                  </p>
                  <button
                    onClick={() => startUploadSim(String(rechazados[0].id))}
                    className="mt-2 t-xs bold text-red underline cursor-pointer"
                  >
                    Reemplazar ahora →
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* CATEGORIES CARDS */}
        {/* FIX #6: Completeness indicator per category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {currentCategories.map((category: any, idx: number) => {
            const listosEnCategoria = category.items.filter((item: any) => {
              return item.status === "LISTO";
            }).length;
            const totalEnCategoria = category.items.length;
            const completenessBadgeClass = listosEnCategoria === totalEnCategoria
              ? "badge b-green"
              : listosEnCategoria > 0
                ? "badge b-amber"
                : "badge b-red";

            return (
              <div
                key={idx}
                className={`card hover:shadow-md transition-shadow ${
                  category.hasError && !uploadedDocIds.includes("2") ? "border-red bg-red-bg/5" : ""
                }`}
              >
                <div className="flex items-center gap-sm mb-md border-b border-[#e2e8f0] pb-2">
                  <span className="material-symbols-outlined text-navy-2 font-fill text-[20px]">
                    {category.icon}
                  </span>
                  <h3 className="t-base bold">
                    {category.title}
                  </h3>
                  {/* Completeness badge */}
                  <span className={`${completenessBadgeClass} ml-auto`}>
                    {listosEnCategoria}/{totalEnCategoria}
                  </span>
                </div>
                <div className="space-y-sm">
                  {category.items.map((item: any, itemIdx: number) => {
                    const status = item.status;

                    return (
                      <div
                        key={itemIdx}
                        className={`flex items-center justify-between p-2 px-3 rounded-[8px] border text-xs ${
                          status === "Reemplazar"
                            ? "bg-red-bg border-red text-red"
                            : "bg-white border-[#e2e8f0]"
                        }`}
                      >
                        <span className="t-xs bold">{item.name}</span>
                        {status === "LISTO" && (
                          <span className="badge b-green">
                            Listo
                          </span>
                        )}
                        {status === "PENDIENTE" && (
                          <button
                            onClick={() => {
                              startUploadSim(String(item.id));
                            }}
                            className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                          >
                            Subir
                          </button>
                        )}
                        {status === "Reemplazar" && (
                          <button
                            onClick={() => startUploadSim(String(item.id))}
                            className="text-red t-xs bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">refresh</span> Reemplazar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE SECTION */}
        <section className="card overflow-hidden" style={{ padding: "0" }}>
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f1f5f9]/50">
            <h2 className="t-md bold">
              Detalle de Documentación
            </h2>
            <div className="flex gap-sm">
              <button className="btn-ico" aria-label="Filtrar">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
              <button className="btn-ico" aria-label="Buscar">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* FIX #9: Fixed table layout with colgroup */}
            <table className="tbl" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "35%" }} />
                <col style={{ width: "38%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Ayuda / Descripción</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <span className={`material-symbols-outlined ${doc.documentIconColor} text-[20px] shrink-0`}>
                          {doc.documentIcon}
                        </span>
                        <div className="min-w-0">
                          {/* FIX #9: truncate + tooltip on long names */}
                          <p className="t-sm bold trunc" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className={`t-xs ${doc.fileTextColor ? "bold" : ""}`} style={{ color: doc.fileTextColor ? "var(--green)" : undefined }}>
                            {doc.fileText}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="t-xs leading-normal">{doc.description}</p>
                    </td>
                    <td>
                      {/* FIX #8: Unified StatusBadge */}
                      <StatusBadge estado={doc.status.estado} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {doc.actionType === "options" ? (
                        <div className="flex justify-end gap-xs">
                          {/* FIX #11: tooltip on preview button */}
                          <button
                            onClick={() => handleSimulatedDownload(doc.name, (doc as any).archivo_url)}
                            className="btn-ico"
                            title="Previsualizar documento"
                            aria-label="Previsualizar documento"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === String(doc.id) ? null : String(doc.id))}
                              className="btn-ico"
                              title="Más opciones"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                            {openMenuId === String(doc.id) && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-border-subtle shadow-lg rounded-xl z-10 overflow-hidden text-left py-1">
                                <button 
                                  onClick={() => { setOpenMenuId(null); startUploadSim(String(doc.id)); }} 
                                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span> Modificar
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setUploadedDocIds(prev => prev.filter(id => id !== String(doc.id)));
                                    setToastMessage("Documento eliminado localmente");
                                    setShowSuccessToast(true);
                                    setTimeout(() => setShowSuccessToast(false), 3000);
                                  }} 
                                  className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startUploadSim(String(doc.id))}
                          className="btn-sub text-xs hover:scale-105 active:scale-95 transition-transform"
                        >
                          {doc.actionText}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DROPZONE AREA */}
        <section>
          <div
            onClick={() => startUploadSim("3")}
            className="border border-dashed border-[#e2e8f0] rounded-[16px] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e8eef8] transition-all"
          >
            <div className="w-12 h-12 bg-[#e8eef8] text-navy-2 rounded-full flex items-center justify-center mb-3 shrink-0">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>
            <h3 className="t-md bold">
              Subir nuevos documentos
            </h3>
            <p className="t-xs mt-2 max-w-md px-4">
              Arrastra y suelta tus archivos aquí o haz clic para explorar. Aceptamos PDF, JPG y PNG hasta 10MB por archivo.
            </p>
            <div className="mt-3 flex gap-2">
              <div className="badge b-slate">
                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                PDF
              </div>
              <div className="badge b-slate">
                <span className="material-symbols-outlined text-[14px]">image</span>
                JPG / PNG
              </div>
            </div>
          </div>
        </section>

        {/* RECOMMENDED COURSES SECTION */}
        <section className="space-y-md border-t border-[#e2e8f0] pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-navy-2 text-xl">workspace_premium</span>
              <h3 className="t-md bold">
                Capacitaciones Recomendadas para tu CV
              </h3>
            </div>
            <p className="t-xs mt-1">
              Completa cursos cortos de alta demanda tecnológica y obtén certificados digitales que se agregarán automáticamente a tu expediente.
            </p>
          </div>

          {/* FIX #14: Tabs for disponibles vs obtenidas */}
          <div className="tabs" style={{ maxWidth: "320px" }}>
            {(["disponibles", "obtenidas"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab ${tab === t ? "on" : ""}`}
              >
                {t === "disponibles"
                  ? `Disponibles (${disponibles.length})`
                  : `Obtenidas (${obtenidas.length})`}
              </button>
            ))}
          </div>

          {listaCapacitaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <span className="material-symbols-outlined text-3xl text-gray-300">
                {tab === "disponibles" ? "school" : "workspace_premium"}
              </span>
              <p className="t-sm bold">
                {tab === "disponibles"
                  ? "No hay capacitaciones disponibles por el momento."
                  : "Aún no has obtenido ningún certificado."}
              </p>
              {tab === "obtenidas" && (
                <button
                  onClick={() => setTab("disponibles")}
                  className="t-xs bold text-navy-2 underline cursor-pointer border-none bg-transparent"
                >
                  Ver capacitaciones disponibles →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {/* FIX #12 + #13 + #15 + #16: Unified card layout */}
              {listaCapacitaciones.map((curso) => {
                const { enMochila, isEnrolled } = curso;

                return (
                  <div
                    key={curso.id}
                    className="card flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        {/* FIX #15: Duration badge — neutral metadata style */}
                        <span className="badge b-slate">
                          {curso.duration}
                        </span>
                      </div>
                      <h4 className="t-base bold mt-1">
                        {curso.title}
                      </h4>
                      <p className="t-xs mt-1 bold">
                        {curso.sponsor}
                      </p>
                      <p className="t-xs mt-3 leading-normal border-t border-[#e2e8f0] pt-2">
                        <span className="bold">Mínimo:</span> {curso.requirement}
                      </p>
                    </div>

                    <div className="mt-4 pt-2">
                      {enMochila ? (
                        // FIX #12: Completed card — positive state
                        <div className="w-full bg-[#dcfce7] border border-[#166534] text-[#166534] rounded-[8px] py-2 font-medium text-xs flex items-center justify-center gap-2">
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          Certificado en mochila
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(curso.id, curso.title)}
                          className={`w-full py-2 rounded-[8px] text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 ${
                            isEnrolled
                              ? "bg-[#1a3a7c] text-white hover:opacity-90 border-none"
                              : "bg-white border border-[#1a3a7c] text-[#1a3a7c] hover:bg-[#e8eef8]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isEnrolled ? "download" : "school"}
                          </span>
                          {isEnrolled ? "Descargar certificado" : "Iniciar Clase"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* SIMULATED FILE UPLOAD MODAL DIALOG */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[99] flex items-center justify-center p-md cursor-default">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-lg border border-border-subtle shadow-2xl flex flex-col gap-md">
            <div className="flex justify-between items-start">
              <h3 className="font-body-bold text-on-surface font-bold text-base leading-tight">
                {user ? "Subir Archivo Real" : "Simulación de Carga Digital"}
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="material-symbols-outlined text-muted-slate hover:text-on-surface cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
              >
                close
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              {user
                ? "Selecciona el archivo en formato PDF o Imagen para subirlo a tu expediente seguro de Supabase."
                : "Selecciona una muestra simulada de archivo PDF para cargar en tu Mochila del Expediente. El sistema validará su autenticidad mediante firma electrónica."}
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-md mt-2">
              {user ? (
                <div className="space-y-sm">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-[10px] text-tertiary font-semibold">
                      Listo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-md bg-surface-container-low rounded-xl border border-border-subtle flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">picture_as_pdf</span>
                  <div>
                    <p className="font-body-bold text-xs font-bold text-slate-700">
                      {selectedDocToUpload === "2"
                        ? "certificado_estudios_camila.pdf"
                        : selectedDocToUpload === "3"
                          ? "ficha_sisfoh_apoderado.pdf"
                          : "documento_sustento_expediente.pdf"}
                    </p>
                    <p className="text-[10px] text-muted-slate mt-0.5">PDF Oficial firmado digitalmente por MINEDU</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-sm cursor-pointer shadow hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                    <span>Subiendo archivo...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    <span>{user ? "Cargar en Supabase" : "Confirmar Carga"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-primary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-in slide-in-from-right-4 duration-300">
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <div>
            <p className="font-body-bold font-bold text-sm">Mochila de Documentos</p>
            <p className="text-xs opacity-90">{toastMessage}</p>
          </div>
        </div>
      )}
    </main>
  );
}
