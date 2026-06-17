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
      // Check if supabase client is placeholder
      if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
        console.warn("Using simulated login due to placeholder credentials.");
        // Simulated bypass for easy developer onboarding
        setTimeout(() => {
          setIsLoading(false);
          navigate("/dashboard");
        }, 1000);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg(err.message || "Error al iniciar sesión con Google.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
        console.warn("Using simulated registration due to placeholder credentials.");
        setTimeout(() => {
          setIsLoading(false);
          navigate("/dashboard");
        }, 1000);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombres: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        if (data.session) {
          navigate("/dashboard");
        } else {
          setSuccessMsg("¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta.");
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || "Error al crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F1F5F9] font-sans select-none">
      {/* Header Sticky Navbar */}
      <header className="w-full py-3 px-6 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#e8eef8] rounded-[8px] flex items-center justify-center text-[#1a3a7c]">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            <span className="t-base bold text-[#0F2554]">Pathfinder</span>
          </div>
          <div className="hidden md:flex gap-6 items-center t-xs bold text-[#64748b]">
            <span>Convocatorias 2026</span>
            <span>Ayuda</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Fondo académico"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVoEWQSYsQnLza8aR_U_smlTRziaaJ9Y1rBPEijlnNG-8tPUikh3jSw8iJIwhHhJghTOXC4xeaKKQyxzhcL4UXbHIQxC-jOHcSqjwsQ8adkLYdXZ3sEZM6IYBvmGMN3GTt45SQ_vKf4rjHZCq97Dkkk5TlPl8FZhOnLwJ8c2XT6r9jLl4IC8te-QjPr87svkCKBKQelelvqf7n4yPXA-ym2kXTgjaXTGeuItgia9Nope5v_f5wiltzX9SkbPvg4Jw1Qp0a9cAC3g"
          />
          <div className="absolute inset-0 bg-[#0F2554]/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2554]/50 to-[#0F2554]"></div>
        </div>

        {/* Central visual wrapper */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center gap-6 text-white">
          {/* Marketing Column */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <h1 className="t-lg bold text-white text-[24px] md:text-[28px] leading-tight mb-4">
              Postular a una beca no tiene por qué ser un dolor de cabeza
            </h1>
            <p className="t-sm text-white/95 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Olvídate de revisar cientos de páginas del gobierno o de las universidades a la vez. Aquí calculamos tus posibilidades reales y te decimos exactamente qué necesitas para ganar esa beca.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 text-left max-w-xs mx-auto lg:mx-0">
                <div className="p-2 bg-white/10 rounded-[8px] border border-white/20">
                  <span className="material-symbols-outlined text-[#ffdf94] text-[18px]">verified</span>
                </div>
                <div>
                  <h3 className="t-xs bold text-white">Todo centralizado</h3>
                  <p className="t-xs text-white/70">Conectamos todas las convocatorias vigentes.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left max-w-xs mx-auto lg:mx-0">
                <div className="p-2 bg-white/10 rounded-[8px] border border-white/20">
                  <span className="material-symbols-outlined text-[#ffdf94] text-[18px]">query_stats</span>
                </div>
                <div>
                  <h3 className="t-xs bold text-white">Tus tareas reales</h3>
                  <p className="t-xs text-white/70">Te ayudamos a armar tu mochila de documentos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Card Column */}
          <div className="w-full max-w-[400px] bg-white text-[#0F2554] rounded-[16px] shadow-2xl overflow-hidden border border-[#e2e8f0] shrink-0">
            <div className="p-6 pb-2 text-center">
              <h2 className="t-md bold text-[#0F2554] mb-1">Bienvenido de nuevo</h2>
              <p className="t-xs text-[#64748b]">Tu camino hacia la excelencia académica comienza aquí</p>
            </div>

            <div className="p-4">
              {/* Tab Toggles */}
              <div className="tabs mb-4 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`tab ${activeTab === "login" ? "on" : ""}`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`tab ${activeTab === "register" ? "on" : ""}`}
                >
                  Registrarse
                </button>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] text-[#0F2554] py-2 px-4 rounded-[8px] hover:bg-slate-50 transition-colors mb-4 shadow-sm cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-4 h-4" />
                <span className="t-xs bold">Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">O con correo</span>
                <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
              </div>

              {/* Form Content */}
              <div className="px-2 pb-2">
                {errorMsg && (
                  <div className="mb-3 p-2 bg-[#fee2e2] text-[#991b1b] t-xs rounded-[8px] border border-[#fee2e2] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-3 p-2 bg-[#dcfce7] text-[#166534] t-xs rounded-[8px] border border-[#dcfce7] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{successMsg}</span>
                  </div>
                )}

                {activeTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label
                        className="t-label text-[#64748b] block mb-1"
                        htmlFor="login-email"
                      >
                        Correo Electrónico
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label
                          className="t-label text-[#64748b] block mb-1"
                          htmlFor="login-password"
                        >
                          Contraseña
                        </label>
                        <a href="#" className="t-link bg-transparent border-none">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0F2554] text-white py-2.5 rounded-[8px] shadow-sm hover:bg-[#1a3a7c] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer text-center t-xs bold mt-2 flex items-center justify-center gap-1.5 border-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label
                        className="t-label text-[#64748b] block mb-1"
                        htmlFor="reg-name"
                      >
                        Nombre Completo
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className="t-label text-[#64748b] block mb-1"
                        htmlFor="reg-email"
                      >
                        Correo Electrónico
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className="t-label text-[#64748b] block mb-1"
                        htmlFor="reg-password"
                      >
                        Contraseña para la cuenta
                      </label>
                      <input
                        id="reg-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] px-3 py-2 t-base focus:border-[#1a3a7c] outline-none transition-all text-[#0F2554]"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0F2554] text-white py-2.5 rounded-[8px] shadow-sm hover:bg-[#1a3a7c] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer text-center t-xs bold mt-2 flex items-center justify-center gap-1.5 border-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Creando cuenta...</span>
                        </>
                      ) : (
                        "Crear cuenta"
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#e2e8f0]"></span>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-white px-3 t-xs uppercase tracking-[0.15em] text-[#64748b]">
                    O continuar con
                  </span>
                </div>
              </div>

              {/* OAuth Option */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-sub w-full py-2 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#0F2554]"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                <span className="t-xs bold text-[#0F2554]">Google</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
