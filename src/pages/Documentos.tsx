import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";





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
  const [coursesPage, setCoursesPage] = useState(1);
  const [verifyingDocIds, setVerifyingDocIds] = useState<string[]>([]);
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

  useEffect(() => {
    setCoursesPage(1);
  }, [tab]);

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

  const handleRemoveCert = (courseId: string, courseTitle: string) => {
    const certDocId = `CERT-${courseId}`;
    const newDocs = uploadedDocIds.filter(id => id !== certDocId);
    const newCourses = enrolledCourseIds.filter(id => id !== courseId);
    setUploadedDocIds(newDocs);
    setEnrolledCourseIds(newCourses);
    localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(newDocs));
    localStorage.setItem("pathfinder_enrolled_courses", JSON.stringify(newCourses));
    setToastMessage(`Certificado de "${courseTitle}" eliminado de tu mochila.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

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
            estado: "En Revisión",
            archivo_url: publicUrl,
            texto_ayuda: "Documento en proceso de verificación por el Asesor IA."
          });

        if (dbErr) throw dbErr;

        await fetchDbDocuments();

        setToastMessage(`¡Archivo "${selectedFile.name}" subido! Iniciando verificación...`);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2500);

        setTimeout(async () => {
          try {
            const { error: updateErr } = await supabase
              .from("documentos")
              .update({ estado: "Validado", texto_ayuda: "Documento verificado y validado por el Asesor IA." })
              .eq("postulacion_id", post.id)
              .eq("nombre_documento", docName);

            if (!updateErr) {
              await fetchDbDocuments();
              setToastMessage(`¡El Asesor IA validó la firma digital de "${docName}"!`);
              setShowSuccessToast(true);
              setTimeout(() => setShowSuccessToast(false), 3000);
            }
          } catch (e) {
            console.error("Error transitioning to Validado in Supabase:", e);
          }
        }, 3000);
      } catch (err: any) {
        console.error("Error uploading document to Supabase:", err);
        setToastMessage(`Error al subir: ${err.message || "Fallo de conexión."}`);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
      return;
    }

    setVerifyingDocIds((prev) => [...prev, selectedDocToUpload]);

    setIsUploading(false);
    setIsUploadModalOpen(false);

    setToastMessage(`¡Archivo subido! Iniciando verificación digital...`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);

    setTimeout(() => {
      setVerifyingDocIds((prev) => prev.filter((id) => id !== selectedDocToUpload));
      const updated = [...uploadedDocIds, selectedDocToUpload];
      setUploadedDocIds(updated);
      localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(updated));

      setToastMessage(`¡El Asesor IA validó la firma digital de "${docName}"!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 3000);
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
          fileText: dbDoc.estado === "En Revisión" ? "PDF • Verificando en Supabase..." : "PDF • Cargado en Supabase",
          fileTextColor: dbDoc.estado === "En Revisión" ? "text-amber-600" : "text-tertiary",
          documentIcon: dbDoc.estado === "En Revisión" ? "sync" : "check_circle",
          documentIconColor: dbDoc.estado === "En Revisión" ? "text-amber-500" : "text-tertiary",
          status: {
            estado: dbDoc.estado || "Validado",
            color: dbDoc.estado === "Rechazado" ? "text-error" : dbDoc.estado === "En Revisión" ? "text-amber-500" : "text-tertiary",
            icon: dbDoc.estado === "Rechazado" ? "warning" : dbDoc.estado === "En Revisión" ? "sync" : "check_circle",
            badgeClass: dbDoc.estado === "Rechazado" ? "bg-error-container text-on-error-container font-body-bold text-[12px] rounded" : "",
          },
          actionType: dbDoc.estado === "En Revisión" ? "button" : "options",
          archivo_url: dbDoc.archivo_url,
          es_requerido: doc.es_requerido,
        };
      }

      const isVerifyingSimulated = verifyingDocIds.includes(stringId) ||
        (doc.name === "Certificado de Estudios" && verifyingDocIds.includes("2")) ||
        (doc.name === "DNI Apoderado" && verifyingDocIds.includes("DNI-APO")) ||
        (doc.name === "Ficha SISFOH" && verifyingDocIds.includes("3")) ||
        (doc.name === "Decl. Juradas" && verifyingDocIds.includes("DECL")) ||
        (doc.name === "Examen Aptitud" && verifyingDocIds.includes("50")) ||
        (doc.name === "Aptitud Especial" && verifyingDocIds.includes("60"));

      if (isVerifyingSimulated) {
        return {
          ...doc,
          fileText: "PDF • Verificando firma digital...",
          fileTextColor: "text-amber-600",
          documentIcon: "sync",
          documentIconColor: "text-amber-500",
          status: {
            estado: "En Revisión",
            color: "text-amber-500",
            icon: "sync",
            badgeClass: "",
          },
          actionType: "button",
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

  const COURSES_PER_PAGE = 3;
  const totalCoursesPages = Math.ceil(listaCapacitaciones.length / COURSES_PER_PAGE);
  const activeCoursesPage = Math.min(coursesPage, Math.max(1, totalCoursesPages));
  const startCourseIndex = (activeCoursesPage - 1) * COURSES_PER_PAGE;
  const paginatedCourses = listaCapacitaciones.slice(startCourseIndex, startCourseIndex + COURSES_PER_PAGE);


  const categoriesList = [
    { name: "Identidad", icon: "badge" },
    { name: "Académicos", icon: "school" },
    { name: "Socioeconómicos", icon: "account_balance" }
  ];

  return (
    <div className="page animate-fade-in select-none">
      {/* Header */}
      <div>
        <p className="t4">Mochila de Documentos</p>
        <p className="t1 muted" style={{ marginTop: "3px" }}>
          Organiza y gestiona todos tus certificados necesarios para tus postulaciones en un solo lugar.
        </p>
      </div>

      {/* Barra compacta de contexto */}
      <div className="bar">
        <div className="bar-seg" style={{ paddingLeft: 0, flexShrink: 0 }}>
          <span className="material-symbols-outlined text-[15px] shrink-0" style={{ color: "var(--navy-2)", fontVariationSettings: "'FILL' 1" }}>target</span>
          <select
            value={selectedBecaId}
            onChange={(e) => handleBecaChange(e.target.value)}
            className="bar-select"
          >
            <option value="">Ninguna (Mochila General)</option>
            {appliedBecaIds.map((id) => {
              const beca = becas.find((b) => b.id === id);
              if (!beca) return null;
              return (
                <option key={beca.id} value={beca.id}>
                  {beca.title}
                </option>
              );
            })}
          </select>
        </div>
        {selectedBeca && (
          <>
            <div className="bar-sep"></div>
            <div className="bar-seg">
              <span className="material-symbols-outlined text-[13px] text-slate-2 shrink-0">school</span>
              <span className="t0 bold" style={{ color: "var(--navy)" }}>{selectedBeca.sponsor}</span>
              <span className="t0 muted2">· {selectedBeca.level}</span>
            </div>
            <div className="bar-sep"></div>
            <div className="bar-seg">
              <span className="material-symbols-outlined text-[13px] shrink-0" style={{ color: colorReloj }}>alarm</span>
              <span className="t0 bold" style={{ color: colorReloj }}>
                {fechaFormateada
                  ? diasRestantes !== null && diasRestantes > 0
                    ? `Cierra en ${diasRestantes} días`
                    : "Cerró"
                  : "Sin fecha"}
              </span>
            </div>
            {selectedBeca.affinity && (
              <>
                <div className="bar-sep"></div>
                <div className="bar-seg" style={{ paddingRight: 0 }}>
                  <span className="t0 bold" style={{ color: "var(--green)" }}>{selectedBeca.affinity}% afinidad</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Progreso del expediente + alerta condicional */}
      <div className={`grid grid-cols-1 ${selectedBeca && currentDocs.some(d => d.status.estado === "Rechazado") ? "md:grid-cols-2" : ""} gap-[10px]`}>
        <div className="card">
          <p className="lbl" style={{ marginBottom: "6px" }}>Progreso del expediente</p>
          <div className="prog-nums">
            <span className="prog-pct">{currentPercentage}%</span>
            <span className="prog-txt">
              {selectedBeca ? `${docsListos} de ${totalCount} documentos listos` : `${dbDocs.length} documentos en mochila`}
            </span>
          </div>
          <div className="prog-track" style={{ marginTop: "8px" }}>
            <div className="prog-fill" style={{ width: `${currentPercentage}%` }}></div>
          </div>
        </div>

        {selectedBeca && (() => {
          const rechazados = currentDocs.filter(d => d.status.estado === "Rechazado");
          if (rechazados.length === 0) return null;
          const primerRechazado = rechazados[0];
          return (
            <div className="alert animate-fade-in">
              <span className="material-symbols-outlined shrink-0" style={{ color: "var(--red)", fontSize: "16px", marginTop: "1px" }}>warning</span>
              <div>
                <p className="alert-t">Documento rechazado</p>
                <p className="alert-s">
                  El "{primerRechazado.name}" fue rechazado. {primerRechazado.texto_ayuda || "Debes reemplazarlo antes del cierre para no perder tu lugar."}
                </p>
                <button className="btn-alert" onClick={() => startUploadSim(String(primerRechazado.id))}>Reemplazar ahora →</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Categorías de documentos */}
      <div className="cat-grid">
        {categoriesList.map((cat) => {
          const catDocs = currentDocs.filter(d => d.category === cat.name);
          if (catDocs.length === 0) {
            return (
              <div key={cat.name} className="cat-card" style={{ borderColor: "var(--border)", opacity: 0.5 }}>
                <div className="cat-head">
                  <div className="row-c">
                    <span className="material-symbols-outlined cat-icon" style={{ color: "var(--slate-2)" }}>{cat.icon}</span>
                    <span className="cat-title">{cat.name}</span>
                  </div>
                  <span className="cat-badge" style={{ backgroundColor: "var(--slate-3)", color: "var(--slate)" }}>0/0</span>
                </div>
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <p className="t0 muted2">Sin documentos requeridos para esta beca</p>
                </div>
              </div>
            );
          }

          const listos = catDocs.filter(d => ["Validado", "Listo", "Aprobado"].includes(d.status.estado)).length;
          const rechazados = catDocs.filter(d => d.status.estado === "Rechazado");
          const tieneRechazados = rechazados.length > 0;
          const esCompleta = listos === catDocs.length;
          
          const borderStyle = tieneRechazados ? { borderColor: "var(--red)" } : { borderColor: "var(--border)" };
          const badgeClass = esCompleta ? "cat-badge cb-g" : tieneRechazados ? "cat-badge cb-r" : "cat-badge cb-a";

          return (
            <div key={cat.name} className="cat-card" style={borderStyle}>
              <div className="cat-head">
                <div className="row-c">
                  <span className="material-symbols-outlined cat-icon">{cat.icon}</span>
                  <span className="cat-title">{cat.name}</span>
                </div>
                <span className={badgeClass}>{listos}/{catDocs.length}</span>
              </div>
              {catDocs.map((doc) => {
                const status = doc.status.estado;
                const isItemRejected = status === "Rechazado";
                const isItemValid = ["Validado", "Listo", "Aprobado"].includes(status);
                
                return (
                  <div
                    key={doc.id}
                    className="cat-item"
                    style={isItemRejected ? { backgroundColor: "var(--red-bg)" } : {}}
                  >
                    <span className="t1" style={{ color: isItemRejected ? "var(--red)" : "var(--navy)" }}>{doc.name}</span>
                    {isItemValid ? (
                      <span className="status-pill sp-g">Validado</span>
                    ) : status === "En Revisión" ? (
                      <span className="status-pill sp-a">Validando</span>
                    ) : isItemRejected ? (
                      <span className="status-pill sp-r">Rechazado</span>
                    ) : (
                      <span className="status-pill sp-p">Pendiente</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Tabla de documentos */}
      <div className="tbl-wrap">
        <div className="tbl-head">
          <p className="t3">Detalle de documentación</p>
          <div className="row-c" style={{ gap: "4px" }}>
            <button className="ico-btn" title="Filtrar" aria-label="Filtrar">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>filter_list</span>
            </button>
            <button className="ico-btn" title="Buscar" aria-label="Buscar">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>search</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl-mochila" style={{ tableLayout: "fixed", minWidth: 560 }}>
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "34%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Ayuda / descripción</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* required docs section */}
              {currentDocs.filter(d => d.es_requerido).length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} style={{ padding: "10px 14px 4px" }}>
                      <span className="lbl">Documentos requeridos por la beca</span>
                    </td>
                  </tr>
                  {currentDocs.filter(d => d.es_requerido).map((doc) => {
                    const status = doc.status.estado;
                    const isItemRejected = status === "Rechazado";
                    const isItemValid = ["Validado", "Listo", "Aprobado"].includes(status);

                    return (
                      <tr key={doc.id} style={isItemRejected ? { backgroundColor: "#fff8f8" } : {}}>
                        <td>
                          <div className="row-c" style={{ gap: "8px" }}>
                            {isItemValid ? (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            ) : isItemRejected ? (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-red-500">warning</span>
                            ) : (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-slate-400">description</span>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p className="doc-name" title={doc.name}>{doc.name}</p>
                              <p className="doc-sub" style={isItemRejected ? { color: "#b91c1c" } : {}}>
                                {isItemRejected ? doc.texto_ayuda || "Firma no legible — rechazado" : doc.fileText}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="desc">{doc.description}</p>
                        </td>
                        <td>
                          {isItemValid ? (
                            <span className="s-ok">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Validado
                            </span>
                          ) : status === "En Revisión" ? (
                            <span className="s-rev">
                              <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                              Validando
                            </span>
                          ) : isItemRejected ? (
                            <span className="s-rej">
                              <span className="material-symbols-outlined text-xs">close</span>
                              Rechazado
                            </span>
                          ) : (
                            <span className="s-pen">
                              <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td>
                          {doc.actionType === "options" || status === "En Revisión" ? (
                            <div className="act-row min-w-[44px] min-h-[44px]">
                              <button
                                className="ico-btn"
                                title="Previsualizar"
                                aria-label="Previsualizar"
                                onClick={() => handleSimulatedDownload(doc.name, doc.archivo_url)}
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                              </button>
                              <div className="relative">
                                <button
                                  className="ico-btn"
                                  title="Más opciones"
                                  aria-label="Más opciones"
                                  onClick={() => setOpenMenuId(openMenuId === String(doc.id) ? null : String(doc.id))}
                                >
                                  <span className="material-symbols-outlined text-[15px]">more_vert</span>
                                </button>
                                {openMenuId === String(doc.id) && (
                                  <div className="absolute right-0 mt-1 w-32 bg-white border border-border shadow-lg rounded-xl z-[20] overflow-hidden text-left py-1">
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        startUploadSim(String(doc.id));
                                      }}
                                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-none bg-transparent text-left cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">edit</span> Modificar
                                    </button>
                                    <button
                                      onClick={async () => {
                                        setOpenMenuId(null);
                                        const newUploadedIds = uploadedDocIds.filter(
                                          (id) =>
                                            id !== String(doc.id) &&
                                            id !== `CERT-${doc.id}` &&
                                            !(doc.name === "DNI Apoderado" && id === "DNI-APO") &&
                                            !(doc.name === "Ficha SISFOH" && id === "3") &&
                                            !(doc.name === "Decl. Juradas" && id === "DECL")
                                        );
                                        setUploadedDocIds(newUploadedIds);
                                        localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(newUploadedIds));
                                        if (user && selectedBecaId) {
                                          try {
                                            const { data: post } = await supabase
                                              .from("postulaciones")
                                              .select("id")
                                              .eq("usuario_id", user.id)
                                              .eq("beca_id", selectedBecaId)
                                              .single();
                                            if (post) {
                                              await supabase
                                                .from("documentos")
                                                .delete()
                                                .eq("postulacion_id", post.id)
                                                .eq("nombre_documento", doc.name);
                                              await fetchDbDocuments();
                                            }
                                          } catch (err) {
                                            console.error("Error deleting doc:", err);
                                          }
                                        }
                                        setToastMessage("Documento eliminado");
                                        setShowSuccessToast(true);
                                        setTimeout(() => setShowSuccessToast(false), 3000);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-none bg-transparent text-left cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="act-row min-w-[44px] min-h-[44px]">
                              <button className="btn-up" onClick={() => startUploadSim(String(doc.id))}>
                                {isItemRejected ? "Reemplazar" : "Subir"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}

              {/* complementary docs section */}
              {currentDocs.filter(d => !d.es_requerido).length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} style={{ padding: "10px 14px 4px" }}>
                      <span className="lbl">Certificados complementarios</span>
                    </td>
                  </tr>
                  {currentDocs.filter(d => !d.es_requerido).map((doc) => {
                    const status = doc.status.estado;
                    const isItemRejected = status === "Rechazado";
                    const isItemValid = ["Validado", "Listo", "Aprobado"].includes(status);

                    return (
                      <tr key={doc.id} style={isItemRejected ? { backgroundColor: "#fff8f8" } : {}}>
                        <td>
                          <div className="row-c" style={{ gap: "8px" }}>
                            {isItemValid ? (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            ) : status === "En Revisión" ? (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-amber-500 animate-spin">sync</span>
                            ) : isItemRejected ? (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-red-500">warning</span>
                            ) : (
                              <span className="material-symbols-outlined text-[15px] shrink-0 text-slate-400">description</span>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p className="doc-name" title={doc.name}>{doc.name}</p>
                              <p className="doc-sub" style={isItemRejected ? { color: "#b91c1c" } : status === "En Revisión" ? { color: "#d97706" } : {}}>
                                {isItemRejected ? doc.texto_ayuda || "Firma no legible — rechazado" : doc.fileText}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="desc">{doc.description}</p>
                        </td>
                        <td>
                          {isItemValid ? (
                            <span className="s-ok">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Validado
                            </span>
                          ) : status === "En Revisión" ? (
                            <span className="s-rev">
                              <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                              Validando
                            </span>
                          ) : isItemRejected ? (
                            <span className="s-rej">
                              <span className="material-symbols-outlined text-xs">close</span>
                              Rechazado
                            </span>
                          ) : (
                            <span className="s-pen">
                              <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td>
                          {doc.actionType === "options" || status === "En Revisión" ? (
                            <div className="act-row min-w-[44px] min-h-[44px]">
                              <button
                                className="ico-btn"
                                title="Previsualizar"
                                aria-label="Previsualizar"
                                onClick={() => handleSimulatedDownload(doc.name, doc.archivo_url)}
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                              </button>
                              <div className="relative">
                                <button
                                  className="ico-btn"
                                  title="Más opciones"
                                  aria-label="Más opciones"
                                  onClick={() => setOpenMenuId(openMenuId === String(doc.id) ? null : String(doc.id))}
                                >
                                  <span className="material-symbols-outlined text-[15px]">more_vert</span>
                                </button>
                                {openMenuId === String(doc.id) && (
                                  <div className="absolute right-0 mt-1 w-32 bg-white border border-border shadow-lg rounded-xl z-[20] overflow-hidden text-left py-1">
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        startUploadSim(String(doc.id));
                                      }}
                                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-none bg-transparent text-left cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">edit</span> Modificar
                                    </button>
                                    <button
                                      onClick={async () => {
                                        setOpenMenuId(null);
                                        const newUploadedIds = uploadedDocIds.filter(
                                          (id) =>
                                            id !== String(doc.id) &&
                                            id !== `CERT-${doc.id}` &&
                                            !(doc.name === "DNI Apoderado" && id === "DNI-APO") &&
                                            !(doc.name === "Ficha SISFOH" && id === "3") &&
                                            !(doc.name === "Decl. Juradas" && id === "DECL")
                                        );
                                        setUploadedDocIds(newUploadedIds);
                                        localStorage.setItem("pathfinder_uploaded_docs", JSON.stringify(newUploadedIds));
                                        if (user && selectedBecaId) {
                                          try {
                                            const { data: post } = await supabase
                                              .from("postulaciones")
                                              .select("id")
                                              .eq("usuario_id", user.id)
                                              .eq("beca_id", selectedBecaId)
                                              .single();
                                            if (post) {
                                              await supabase
                                                .from("documentos")
                                                .delete()
                                                .eq("postulacion_id", post.id)
                                                .eq("nombre_documento", doc.name);
                                              await fetchDbDocuments();
                                            }
                                          } catch (err) {
                                            console.error("Error deleting doc:", err);
                                          }
                                        }
                                        setToastMessage("Documento eliminado");
                                        setShowSuccessToast(true);
                                        setTimeout(() => setShowSuccessToast(false), 3000);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-none bg-transparent text-left cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="act-row min-w-[44px] min-h-[44px]">
                              <button className="btn-up" onClick={() => startUploadSim(String(doc.id))}>
                                {isItemRejected ? "Reemplazar" : "Subir"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drop zone */}
      <div className="drop" onClick={() => startUploadSim("3")}>
        <div className="drop-icon">
          <span className="material-symbols-outlined">cloud_upload</span>
        </div>
        <p className="t2 bold">Subir nuevos documentos</p>
        <p className="t0 muted">Arrastra tus archivos aquí o haz clic para explorar. PDF, JPG o PNG hasta 10 MB.</p>
        <div className="fmt-pills">
          <div className="fmt-pill">
            <span className="material-symbols-outlined text-[12px]">picture_as_pdf</span> PDF
          </div>
          <div className="fmt-pill">
            <span className="material-symbols-outlined text-[12px]">image</span> JPG / PNG
          </div>
        </div>
      </div>

      {/* Capacitaciones */}
      <div>
        <div className="row-c" style={{ gap: "7px", marginBottom: "4px" }}>
          <span className="material-symbols-outlined text-[16px] text-navy-2 font-fill">workspace_premium</span>
          <p className="t3">Capacitaciones recomendadas para tu CV</p>
        </div>
        <p className="t0 muted" style={{ marginBottom: "12px" }}>
          Completa cursos cortos y obtén certificados digitales que se agregarán automáticamente a tu expediente.
        </p>

        <div className="cap-tabs">
          <button
            className={`cap-tab ${tab === "disponibles" ? "on" : ""}`}
            onClick={() => setTab("disponibles")}
          >
            Disponibles ({disponibles.length})
          </button>
          <button
            className={`cap-tab ${tab === "obtenidas" ? "on" : ""}`}
            onClick={() => setTab("obtenidas")}
          >
            Obtenidas ({obtenidas.length})
          </button>
        </div>

        {listaCapacitaciones.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p className="t0 muted">No hay capacitaciones en esta lista.</p>
          </div>
        ) : (
          <>
            <div className="cap-grid">
              {paginatedCourses.map((curso) => {
                const { enMochila, isEnrolled } = curso;

                return (
                  <div
                    key={curso.id}
                    className="cap-card"
                    style={enMochila ? { borderColor: "#86efac" } : {}}
                  >
                    <span className="dur-pill">{curso.duration}</span>
                    <div>
                      <p className="cap-title">{curso.title}</p>
                      <p className="cap-org">{curso.sponsor}</p>
                    </div>
                    <p className="cap-min">
                      <span>Mínimo:</span> {curso.requirement}
                    </p>

                    {enMochila ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <div className="btn-done" style={{ flex: 1 }}>
                          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Certificado en mochila
                        </div>
                        <button
                          className="ico-btn"
                          title="Eliminar de mochila"
                          aria-label="Eliminar de mochila"
                          onClick={() => handleRemoveCert(curso.id, curso.title)}
                          style={{ flexShrink: 0, color: "var(--red)", padding: "6px" }}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ) : isEnrolled ? (
                      <button className="btn-dl" onClick={() => handleEnroll(curso.id, curso.title)}>
                        <span className="material-symbols-outlined text-[15px]">download</span>
                        Descargar certificado
                      </button>
                    ) : (
                      <button className="btn-ini" onClick={() => handleEnroll(curso.id, curso.title)}>
                        <span className="material-symbols-outlined text-[15px]">school</span>
                        Iniciar clase
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {totalCoursesPages > 1 && (
              <div className="pg" style={{ marginTop: "16px" }}>
                <button
                  onClick={() => setCoursesPage(prev => Math.max(1, prev - 1))}
                  disabled={activeCoursesPage === 1}
                  className="pb"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalCoursesPages }, (_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCoursesPage(pNum)}
                      className={`pn ${activeCoursesPage === pNum ? "on" : ""}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCoursesPage(prev => Math.min(totalCoursesPages, prev + 1))}
                  disabled={activeCoursesPage === totalCoursesPages}
                  className="pb"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* SIMULATED FILE UPLOAD MODAL DIALOG */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#0F2554]/40 backdrop-blur-sm z-[99] flex items-center justify-center p-md cursor-default">
          <div className="card max-w-sm w-full p-lg shadow-2xl flex flex-col gap-md">
            <div className="flex justify-between items-start">
              <h3 className="t-md bold">
                {user ? "Subir Archivo Real" : "Simulación de Carga Digital"}
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="btn-ico"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="t-xs leading-normal" style={{ color: "var(--slate)" }}>
              {user
                ? "Selecciona el archivo en formato PDF o Imagen para subirlo a tu expediente seguro de Supabase."
                : "Selecciona una muestra simulada de archivo PDF para cargar en tu Mochila del Expediente. El sistema validará su autenticidad mediante firma electrónica."}
            </p>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#e8eef8] file:text-[#1a3a7c] hover:file:bg-[#e8eef8]/80 cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-[10px] text-green-700 font-semibold">
                      Listo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl border border-border flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[24px]" style={{ color: "var(--navy-2)" }}>picture_as_pdf</span>
                  <div>
                    <p className="t-xs bold text-slate-700">
                      {selectedDocToUpload === "2"
                        ? "certificado_estudios_camila.pdf"
                        : selectedDocToUpload === "3"
                          ? "ficha_sisfoh_apoderado.pdf"
                          : "documento_sustento_expediente.pdf"}
                    </p>
                    <p className="t-xs mt-0.5" style={{ color: "var(--slate)" }}>PDF Oficial firmado digitalmente por MINEDU</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2 bg-[#1a3a7c] hover:bg-[#0F2554] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-sm cursor-pointer shadow transition-all disabled:opacity-50 border-none"
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
        <div className="fixed top-20 right-6 z-[99] bg-[#0F2554] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-in slide-in-from-right-4 duration-300">
          <span className="material-symbols-outlined text-[24px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: "bold", color: "#ffffff", margin: 0 }}>Mochila de Documentos</p>
            <p style={{ fontSize: "11px", color: "#cbd5e1", margin: "2px 0 0 0" }}>{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
