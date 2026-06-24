import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
        setTimeout(() => { setIsLoading(false); navigate("/dashboard"); }, 900);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión con Google.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
        setTimeout(() => { setIsLoading(false); navigate("/dashboard"); }, 900);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombres: name }, emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      if (data.user) {
        if (data.session) navigate("/dashboard");
        else setSuccessMsg("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--slate-3)] px-3.5 py-2.5 text-[13px] text-[var(--navy)] placeholder:text-[var(--slate-2)] outline-none transition-all focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-br)] disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] font-sans select-none" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-[8px] bg-[var(--brand)] text-white">
              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <span className="text-[13px] font-semibold text-[var(--navy)]">Pathfinder</span>
          </div>
          <div className="hidden gap-6 md:flex">
            <span className="text-[11px] font-medium text-[var(--slate)] cursor-pointer hover:text-[var(--brand)] transition-colors">Convocatorias 2026</span>
            <span className="text-[11px] font-medium text-[var(--slate)] cursor-pointer hover:text-[var(--brand)] transition-colors">Ayuda</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Fondo academico"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVoEWQSYsQnLza8aR_U_smlTRziaaJ9Y1rBPEijlnNG-8tPUikh3jSw8iJIwhHhJghTOXC4xeaKKQyxzhcL4UXbHIQxC-jOHcSqjwsQ8adkLYdXZ3sEZM6IYBvmGMN3GTt45SQ_vKf4rjHZCq97Dkkk5TlPl8FZhOnLwJ8c2XT6r9jLl4IC8te-QjPr87svkCKBKQelelvqf7n4yPXA-ym2kXTgjaXTGeuItgia9Nope5v_f5wiltzX9SkbPvg4Jw1Qp0a9cAC3g"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8]/95 via-[#2563EB]/90 to-[#1E3A8A]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:gap-12">

          {/* Marketing column */}
          <div className="flex-1 text-center lg:text-left text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
              <span className="inline-block size-1.5 rounded-full bg-[#60A5FA]" />
              Convocatorias 2026 abiertas
            </div>
            <h1 className="mb-4 text-[26px] font-bold leading-tight md:text-[32px] text-balance">
              Postular a una beca<br className="hidden lg:block" /> no tiene por qué ser<br className="hidden lg:block" /> un dolor de cabeza
            </h1>
            <p className="mb-7 max-w-lg text-[13px] leading-relaxed text-white/80 mx-auto lg:mx-0">
              Calculamos tus posibilidades reales y te decimos exactamente qué necesitas para ganar esa beca. Todo en un solo lugar.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {[
                { icon: "verified", title: "Todo centralizado", desc: "Conectamos todas las convocatorias vigentes." },
                { icon: "query_stats", title: "Tus tareas reales", desc: "Armamos tu mochila de documentos contigo." },
              ].map((f) => (
                <div key={f.icon} className="flex items-center gap-3 text-left rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm max-w-xs mx-auto lg:mx-0">
                  <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <span className="material-symbols-outlined text-[#FCD34D]" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white">{f.title}</p>
                    <p className="text-[10px] text-white/65 leading-tight">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="w-full max-w-[390px] flex-shrink-0 rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Card header */}
            <div className="px-6 pb-0 pt-6 text-center">
              <h2 className="text-[15px] font-bold text-[var(--navy)]">Bienvenido de nuevo</h2>
              <p className="mt-1 text-[11px] text-[var(--slate)]">Tu camino hacia la excelencia académica</p>
            </div>

            <div className="p-5">
              {/* Tabs */}
              <div className="mb-5 flex rounded-xl bg-[var(--slate-3)] p-0.5 gap-0.5">
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => { setActiveTab(tab); setErrorMsg(""); setSuccessMsg(""); }}
                    className={`flex-1 rounded-[10px] py-2 text-[11px] font-semibold transition-all cursor-pointer border-none ${
                      activeTab === tab
                        ? "bg-white text-[var(--brand)] shadow-sm"
                        : "bg-transparent text-[var(--slate)] hover:text-[var(--navy)]"
                    }`}
                  >
                    {tab === "login" ? "Iniciar Sesión" : "Registrarse"}
                  </button>
                ))}
              </div>

              {/* Google CTA — single, at top */}
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[12px] font-semibold text-[var(--navy)] shadow-sm transition-all hover:border-[var(--brand-br)] hover:bg-[var(--brand-bg)]"
              >
                <svg className="size-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </button>

              {/* Divider */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 border-t border-[var(--border)]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--slate-2)]">O con correo</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-[var(--red-bg)] px-3 py-2.5 text-[11px] text-[var(--red)]">
                  <span className="material-symbols-outlined flex-shrink-0 text-sm">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-green-200 bg-[var(--green-bg)] px-3 py-2.5 text-[11px] text-[var(--green)]">
                  <span className="material-symbols-outlined flex-shrink-0 text-sm">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Forms */}
              {activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="login-email" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]">
                      Correo electrónico
                    </label>
                    <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com" className={inputCls} disabled={isLoading} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]">
                        Contraseña
                      </label>
                      <a href="#" className="text-[10px] font-semibold text-[var(--brand)] hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} disabled={isLoading} />
                  </div>
                  <button
                    type="submit" disabled={isLoading}
                    className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[var(--brand-dk)] hover:scale-[1.01] active:scale-95 disabled:opacity-60 border-none"
                  >
                    {isLoading ? (
                      <><div className="size-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /><span>Procesando...</span></>
                    ) : "Entrar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="reg-name" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]">
                      Nombre completo
                    </label>
                    <input id="reg-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez" className={inputCls} disabled={isLoading} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="reg-email" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]">
                      Correo electrónico
                    </label>
                    <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com" className={inputCls} disabled={isLoading} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="reg-password" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]">
                      Contraseña
                    </label>
                    <input id="reg-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} disabled={isLoading} />
                  </div>
                  <button
                    type="submit" disabled={isLoading}
                    className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[var(--brand-dk)] hover:scale-[1.01] active:scale-95 disabled:opacity-60 border-none"
                  >
                    {isLoading ? (
                      <><div className="size-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /><span>Creando cuenta...</span></>
                    ) : "Crear cuenta"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
