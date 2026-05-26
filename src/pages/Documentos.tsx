import React, { useState } from "react";
import { alertBox, categories, detailedDocuments as defaultDocs } from "../mocks/documentos";
import { cursosMockData, becasMockData } from "../mocks/dataBase";

export default function Documentos() {
  const [selectedBecaId, setSelectedBecaId] = useState<string>(() => {
    return localStorage.getItem("pathfinder_active_meta") || "BEC-01";
  });

  const [appliedBecaIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("pathfinder_applied_becas");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ["BEC-01", "BEC-02", "BEC-03"];
  });

  const selectedBeca = becasMockData.find((b) => b.id === selectedBecaId);

  const handleBecaChange = (id: string) => {
    setSelectedBecaId(id);
    if (id) {
      localStorage.setItem("pathfinder_active_meta", id);
    } else {
      localStorage.removeItem("pathfinder_active_meta");
    }
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
  
  // Simulated upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocToUpload, setSelectedDocToUpload] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Simulated success notifications
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEnroll = (courseId: string, courseTitle: string) => {
    if (enrolledCourseIds.includes(courseId)) {
      // Simulate completing/obtaining certificate
      // Add the certificate to uploaded docs
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
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const startUploadSim = (docId: string) => {
    setSelectedDocToUpload(docId);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate network delay
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

  const handleSimulatedDownload = (docName: string) => {
    setToastMessage(`Descargando copia local de: "${docName}"...`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Compile detailed documents list dynamically, merging default documents with user uploads and course certificates
  const getDetailedDocuments = () => {
    const list = defaultDocs.map((doc) => {
      const stringId = String(doc.id);
      
      // If user has uploaded/replaced the document
      if (uploadedDocIds.includes(stringId)) {
        return {
          ...doc,
          fileText: "PDF • Cargado hace un momento",
          fileTextColor: "text-tertiary",
          documentIcon: "check_circle",
          documentIconColor: "text-tertiary",
          status: {
            estado: "Validado",
            color: "text-tertiary",
            icon: "check_circle",
            badgeClass: "",
          },
          actionType: "options", // Shows verification downloads
        };
      }
      return doc;
    });

    // Add dynamic course certificates that were requested/completed by user
    enrolledCourseIds.forEach((courseId) => {
      const certId = `CERT-${courseId}`;
      if (uploadedDocIds.includes(certId)) {
        const course = cursosMockData.find((c) => c.id === courseId);
        if (course) {
          list.push({
            id: list.length + 100, // Safe unique ID
            name: `Certificado: ${course.title}`,
            fileText: "PDF Oficial de Acreditación",
            fileTextColor: "text-tertiary",
            documentIcon: "verified",
            documentIconColor: "text-tertiary",
            description: `Acreditado por ${course.sponsor}.`,
            status: {
              estado: "Validado",
              color: "text-tertiary",
              icon: "check_circle",
              badgeClass: "bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded font-bold text-[10px]",
            },
            actionType: "options",
          });
        }
      }
    });

    // Add Beca-specific documents dynamically!
    if (selectedBeca) {
      if (selectedBeca.level === "Idioma") {
        list.push({
          id: 50,
          name: "Examen de Aptitud del Idioma",
          fileText: uploadedDocIds.includes("50") ? "PDF • Validado" : "Acreditación de nivel B1/B2",
          fileTextColor: uploadedDocIds.includes("50") ? "text-tertiary" : "",
          documentIcon: uploadedDocIds.includes("50") ? "check_circle" : "translate",
          documentIconColor: uploadedDocIds.includes("50") ? "text-tertiary" : "text-primary",
          description: "Resultado oficial de examen internacional (TOEFL, DELF) o constancia de nivel del instituto.",
          status: {
            estado: uploadedDocIds.includes("50") ? "Validado" : "Pendiente",
            color: uploadedDocIds.includes("50") ? "text-tertiary" : "text-slate-600",
            icon: uploadedDocIds.includes("50") ? "check_circle" : "hourglass_empty",
            badgeClass: uploadedDocIds.includes("50") ? "" : "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded",
          },
          actionType: uploadedDocIds.includes("50") ? "options" : "button",
          actionText: "Subir",
          actionClass: "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors"
        });
      } else if (selectedBeca.level === "Técnico" || selectedBeca.title.includes("Arte") || selectedBeca.title.includes("Deporte") || selectedBeca.title.includes("Minero") || selectedBeca.title.includes("Comunidad")) {
        list.push({
          id: 60,
          name: "Constancia de Aptitud Especial",
          fileText: uploadedDocIds.includes("60") ? "PDF • Validado" : "Acreditación de Aptitud o Residencia",
          fileTextColor: uploadedDocIds.includes("60") ? "text-tertiary" : "",
          documentIcon: uploadedDocIds.includes("60") ? "check_circle" : "military_tech",
          documentIconColor: uploadedDocIds.includes("60") ? "text-tertiary" : "text-primary",
          description: "Constancia oficial de deportista calificado (IPD), portafolio artístico, certificado de comunidad nativa, o de residencia.",
          status: {
            estado: uploadedDocIds.includes("60") ? "Validado" : "Pendiente",
            color: uploadedDocIds.includes("60") ? "text-tertiary" : "text-slate-600",
            icon: uploadedDocIds.includes("60") ? "check_circle" : "hourglass_empty",
            badgeClass: uploadedDocIds.includes("60") ? "" : "bg-surface-container text-on-surface-variant font-body-bold text-[12px] rounded",
          },
          actionType: uploadedDocIds.includes("60") ? "options" : "button",
          actionText: "Subir",
          actionClass: "border border-border-subtle text-on-surface-variant px-4 py-2 rounded-xl text-body-sm font-body-bold hover:bg-surface-container-low transition-colors"
        });
      }
    }

    return list;
  };

  const getCategories = () => {
    const list = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item }))
    }));

    if (selectedBeca) {
      if (selectedBeca.level === "Idioma") {
        list[1].items.push({
          name: "Examen Aptitud",
          status: uploadedDocIds.includes("50") ? "LISTO" : "PENDIENTE"
        });
      } else if (selectedBeca.level === "Técnico" || selectedBeca.title.includes("Arte") || selectedBeca.title.includes("Deporte") || selectedBeca.title.includes("Minero") || selectedBeca.title.includes("Comunidad")) {
        list[1].items.push({
          name: "Aptitud Especial",
          status: uploadedDocIds.includes("60") ? "LISTO" : "PENDIENTE"
        });
      }
    }

    return list;
  };

  const currentCategories = getCategories();
  const currentDocs = getDetailedDocuments();

  // Dynamic progress bar calculation
  const validatedCount = currentDocs.filter((d) => d.status.estado === "Validado").length;
  const totalCount = currentDocs.length;
  const currentPercentage = Math.round((validatedCount / totalCount) * 100);

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar bg-background pb-16">
      <div className="max-w-6xl mx-auto px-md md:px-margin-desktop py-xl space-y-xl w-full">
        {/* HEADER */}
        <header className="flex flex-col gap-1">
          <h1 className="font-display-lg text-headline-md text-on-surface font-extrabold text-2xl md:text-display-lg leading-none">
            Mochila de Documentos
          </h1>
          <p className="font-body-base text-body-base text-muted-slate text-sm md:text-base mt-1">
            Organiza y gestiona todos tus certificados necesarios para tus postulaciones en un solo lugar.
          </p>
        </header>

        {/* Meta Selector Section */}
        <section className="bg-surface p-lg rounded-2xl border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-xl font-fill">target</span>
              <h3 className="font-body-bold font-bold text-sm md:text-base text-on-surface">
                Beca / Meta de Postulación Vinculada
              </h3>
            </div>
            <p className="text-xs text-muted-slate leading-normal">
              Conecta tu Mochila a una de tus metas de becas activas para que el Asesor IA adapte tus requisitos automáticamente.
            </p>
          </div>
          
          <div className="w-full md:w-80 shrink-0">
            <select
              value={selectedBecaId}
              onChange={(e) => handleBecaChange(e.target.value)}
              className="w-full bg-surface-container-low border border-border-subtle rounded-xl p-3 text-sm font-body-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
            >
              <option value="">Ninguna (Mochila General)</option>
              {appliedBecaIds.map((id) => {
                const beca = becasMockData.find((b) => b.id === id);
                if (!beca) return null;
                return (
                  <option key={beca.id} value={beca.id}>
                    [{beca.id}] {beca.title} ({beca.sponsor})
                  </option>
                );
              })}
            </select>
          </div>
        </section>

        {/* Selected Beca Details Badge Card */}
        {selectedBeca && (
          <div className="bg-primary/5 border border-primary/20 p-md rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-md animate-fade-in">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl font-fill">{selectedBeca.icon || "school"}</span>
              </div>
              <div>
                <p className="text-xs text-primary font-bold tracking-wider font-label-caps uppercase">Expediente Requerido</p>
                <h4 className="font-body-bold font-bold text-sm text-on-surface leading-tight mt-0.5">
                  {selectedBeca.title}
                </h4>
                <p className="text-[11px] text-muted-slate mt-0.5">
                  Organizado por <span className="font-bold text-slate-700">{selectedBeca.sponsor}</span> • Requisito: <span className="font-bold text-slate-700">{selectedBeca.requirement}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-md self-start sm:self-center">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-muted-slate uppercase font-bold tracking-wider">Cierre de Convocatoria</p>
                <p className="text-xs font-body-bold font-bold text-error mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">alarm</span>
                  Faltan {selectedBeca.deadline}
                </p>
              </div>
              <div className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">
                Afinidad: {selectedBeca.affinity}%
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS & ALERT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-surface p-lg rounded-2xl shadow-sm border border-border-subtle flex flex-col justify-center">
            <div className="flex justify-between items-end mb-sm">
              <div>
                <p className="font-label-caps text-label-caps text-muted-slate uppercase tracking-wider font-bold text-[11px]">
                  Progreso del Expediente
                </p>
                <p className="font-stat-lg text-stat-lg text-primary-container font-extrabold text-2xl md:text-stat-lg">
                  {currentPercentage}%
                </p>
              </div>
              <p className="font-body-sm text-body-sm text-muted-slate text-xs md:text-sm">
                {validatedCount} de {totalCount} documentos listos
              </p>
            </div>
            <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-700"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-error-container/20 border border-error/10 p-lg rounded-2xl flex items-start gap-md">
            <div className="w-10 h-10 bg-error text-white rounded-full flex items-center justify-center shrink-0 shadow">
              <span className="material-symbols-outlined text-[20px]">priority_high</span>
            </div>
            <div>
              <p className="font-body-bold text-on-error-container text-body-base font-bold text-sm">
                {alertBox.message}
              </p>
              <p className="font-body-sm text-on-error-container/80 text-xs mt-1 leading-normal">
                {alertBox.description}
              </p>
            </div>
          </div>
        </div>

        {/* CATEGORIES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {currentCategories.map((category, idx) => (
            <div
              key={idx}
              className={`bg-surface p-lg rounded-2xl shadow-sm border border-border-subtle hover:shadow-md transition-shadow ${
                category.hasError && !uploadedDocIds.includes("2") ? "border-error-red/20 bg-red-50/5" : ""
              }`}
            >
              <div className="flex items-center gap-sm mb-md border-b border-border-subtle pb-2">
                <span className="material-symbols-outlined text-primary-container font-fill text-[20px]">
                  {category.icon}
                </span>
                <h3 className="font-body-bold text-body-base font-bold text-sm">
                  {category.title}
                </h3>
              </div>
              <div className="space-y-sm">
                {category.items.map((item, itemIdx) => {
                  // Determine status based on uploads
                  let status = item.status;
                  if (item.name === "Certificado de Estudios" && uploadedDocIds.includes("2")) {
                    status = "LISTO";
                  } else if (item.name === "DNI Apoderado" && uploadedDocIds.includes("DNI-APO")) {
                    status = "LISTO";
                  } else if (item.name === "Ficha SISFOH" && uploadedDocIds.includes("3")) {
                    status = "LISTO";
                  } else if (item.name === "Decl. Juradas" && uploadedDocIds.includes("DECL")) {
                    status = "LISTO";
                  } else if (item.name === "Examen Aptitud" && uploadedDocIds.includes("50")) {
                    status = "LISTO";
                  } else if (item.name === "Aptitud Especial" && uploadedDocIds.includes("60")) {
                    status = "LISTO";
                  }

                  return (
                    <div
                      key={itemIdx}
                      className={`flex items-center justify-between p-sm px-md rounded-lg border text-xs ${
                        status === "Reemplazar"
                          ? "bg-error-container/10 border-error/10 text-error-red"
                          : "bg-surface-container-lowest border-border-subtle"
                      }`}
                    >
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      {status === "LISTO" && (
                        <span className="px-2 py-0.5 bg-tertiary-fixed text-tertiary font-label-caps text-[9px] rounded uppercase font-bold">
                          Listo
                        </span>
                      )}
                      {status === "PENDIENTE" && (
                        <button
                          onClick={() => {
                            const mapping: Record<string, string> = {
                              "DNI Apoderado": "DNI-APO",
                              "Ficha SISFOH": "3",
                              "Decl. Juradas": "DECL",
                              "Examen Aptitud": "50",
                              "Aptitud Especial": "60",
                            };
                            startUploadSim(mapping[item.name] || "3");
                          }}
                          className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant font-label-caps text-[9px] rounded uppercase font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          Subir
                        </button>
                      )}
                      {status === "Reemplazar" && (
                        <button
                          onClick={() => startUploadSim("2")}
                          className="text-error font-body-bold text-[10px] flex items-center gap-1 hover:underline cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-xs">refresh</span> Reemplazar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <section className="bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
          <div className="px-lg py-md border-b border-border-subtle flex justify-between items-center bg-slate-50/50">
            <h2 className="font-body-bold text-body-base font-bold text-sm md:text-base">
              Detalle de Documentación
            </h2>
            <div className="flex gap-sm">
              <button className="p-2 text-muted-slate hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
              <button className="p-2 text-muted-slate hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-border-subtle">
                  <th className="px-lg py-3 font-label-caps text-label-caps text-muted-slate uppercase font-bold text-[10px] tracking-wider">
                    Documento
                  </th>
                  <th className="px-lg py-3 font-label-caps text-label-caps text-muted-slate uppercase font-bold text-[10px] tracking-wider">
                    Ayuda / Descripción
                  </th>
                  <th className="px-lg py-3 font-label-caps text-label-caps text-muted-slate uppercase font-bold text-[10px] tracking-wider">
                    Estado
                  </th>
                  <th className="px-lg py-3 font-label-caps text-label-caps text-muted-slate uppercase font-bold text-[10px] tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {currentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-sm">
                        <span className={`material-symbols-outlined ${doc.documentIconColor} text-[20px]`}>
                          {doc.documentIcon}
                        </span>
                        <div>
                          <p className="font-body-bold text-body-sm font-semibold text-slate-800">
                            {doc.name}
                          </p>
                          <p className={`text-[11px] ${doc.fileTextColor || "text-muted-slate"} ${doc.fileTextColor ? "font-semibold" : ""}`}>
                            {doc.fileText}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-4">
                      <p className="text-xs text-muted-slate max-w-xs leading-normal">
                        {doc.description}
                      </p>
                    </td>
                    <td className="px-lg py-4">
                      {doc.status.badgeClass ? (
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap uppercase ${doc.status.badgeClass}`}>
                          {doc.status.estado}
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 ${doc.status.color || "text-slate-600"} font-body-bold text-xs font-bold`}>
                          <span className="material-symbols-outlined text-sm font-fill">
                            {doc.status.icon || "check_circle"}
                          </span>
                          {doc.status.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-lg py-4 text-right">
                      {doc.actionType === "options" ? (
                        <div className="flex justify-end gap-xs">
                          <button
                            onClick={() => handleSimulatedDownload(doc.name)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                            title="Ver / Descargar"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            className="p-1.5 text-muted-slate hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors"
                            title="Más opciones"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startUploadSim(String(doc.id))}
                          className={`${doc.actionClass} cursor-pointer hover:scale-105 active:scale-95 transition-transform text-xs px-3 py-1.5`}
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

        {/* DROPZONE AREA - Restored completely with fixed max-width and layout */}
        <section>
          <div
            onClick={() => startUploadSim("3")}
            className="border-2 border-dashed border-border-subtle rounded-2xl p-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container-low hover:border-primary transition-all shadow-sm"
          >
            <div className="w-14 h-14 bg-surface-container-low text-primary rounded-full flex items-center justify-center mb-md group-hover:scale-115 transition-transform shrink-0 shadow">
              <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
            </div>
            <h3 className="font-headline-md text-headline-md-mobile text-on-surface font-bold text-base md:text-lg">
              Subir nuevos documentos
            </h3>
            <p className="font-body-base text-body-base text-muted-slate mt-2 max-w-md text-xs md:text-sm leading-relaxed px-4">
              Arrastra y suelta tus archivos aquí o haz clic para explorar. Aceptamos PDF, JPG y PNG hasta 10MB por archivo.
            </p>
            <div className="mt-lg flex gap-md">
              <div className="flex items-center gap-sm px-md py-1.5 bg-surface border border-border-subtle rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-muted-slate text-[18px]">picture_as_pdf</span>
                <span className="text-[11px] text-muted-slate font-bold">PDF</span>
              </div>
              <div className="flex items-center gap-sm px-md py-1.5 bg-surface border border-border-subtle rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-muted-slate text-[18px]">image</span>
                <span className="text-[11px] text-muted-slate font-bold">JPG / PNG</span>
              </div>
            </div>
          </div>
        </section>

        {/* RECOMMENDED COURSES SECTION (Category 4: Cursos Cortos y Capacitaciones - 15 Items) */}
        <section className="space-y-md border-t border-border-subtle pt-xl">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
              <h3 className="text-headline-md text-on-surface font-bold text-base md:text-lg leading-none">
                Capacitaciones Recomendadas para tu CV
              </h3>
            </div>
            <p className="text-xs text-muted-slate mt-1">
              Completa cursos cortos de alta demanda tecnológica y obtén certificados digitales que se agregarán automáticamente a tu expediente.
            </p>
          </div>

          {/* Clean responsive grid layout for all 15 courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {cursosMockData.map((curso) => {
              const isEnrolled = enrolledCourseIds.includes(curso.id);
              const hasCertificate = uploadedDocIds.includes(`CERT-${curso.id}`);

              return (
                <div
                  key={curso.id}
                  className={`bg-surface p-lg rounded-2xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                    hasCertificate ? "border-tertiary/20 bg-tertiary-fixed/30" : "border-border-subtle"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-md">
                      <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {curso.duration}
                      </span>
                      <span className={`material-symbols-outlined ${hasCertificate ? "text-tertiary" : "text-muted-slate"} text-[20px] font-fill`}>
                        {hasCertificate ? "verified" : "local_activity"}
                      </span>
                    </div>
                    <h4 className="font-body-bold text-on-surface text-sm font-bold leading-snug">
                      {curso.title}
                    </h4>
                    <p className="text-[11px] text-muted-slate mt-1 font-semibold">
                      {curso.sponsor}
                    </p>
                    <p className="text-[10px] text-muted-slate mt-3 leading-normal border-t border-slate-50 pt-2">
                      <span className="font-bold">Mínimo:</span> {curso.requirement}
                    </p>
                  </div>

                  <div className="mt-lg pt-2">
                    {hasCertificate ? (
                      <div className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-center font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                        Certificado en Mochila
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(curso.id, curso.title)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          isEnrolled
                            ? "bg-[#FFDF94] text-[#594400] border border-[#594400]/20 hover:opacity-90 font-bold"
                            : "bg-surface border-2 border-primary text-primary hover:bg-primary/5 font-bold"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isEnrolled ? "workspace_premium" : "school"}
                        </span>
                        {isEnrolled ? "Descargar Certificado" : "Iniciar Clase"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* SIMULATED FILE UPLOAD MODAL DIALOG */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[99] flex items-center justify-center p-md cursor-default">
          <div className="bg-surface rounded-2xl max-w-sm w-full p-lg border border-border-subtle shadow-2xl flex flex-col gap-md">
            <div className="flex justify-between items-start">
              <h3 className="font-body-bold text-on-surface font-bold text-base leading-tight">
                Simulación de Carga Digital
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="material-symbols-outlined text-muted-slate hover:text-on-surface cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
              >
                close
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Selecciona una muestra simulada de archivo PDF para cargar en tu Mochila del Expediente. El sistema validará su autenticidad mediante firma electrónica.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-md mt-2">
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

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-sm cursor-pointer shadow hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                    <span>Validando firmas...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">cloud_done</span>
                    <span>Confirmar Carga de Archivo</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[99] bg-primary text-white p-lg rounded-2xl shadow-2xl flex items-center gap-md border border-white/20 animate-bounce">
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
