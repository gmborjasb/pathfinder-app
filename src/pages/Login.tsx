import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect
    navigate("/dashboard");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate register and redirect
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F1F5F9] font-['Plus_Jakarta_Sans'] select-none">
      {/* Header Sticky Navbar */}
      <header className="w-full py-5 px-6 md:px-margin-desktop bg-white/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">school</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-primary">Pathfinder</span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-semibold text-muted-slate">
            <span>Convocatorias 2026</span>
            <span>Ayuda</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Fondo académico"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVoEWQSYsQnLza8aR_U_smlTRziaaJ9Y1rBPEijlnNG-8tPUikh3jSw8iJIwhHhJghTOXC4xeaKKQyxzhcL4UXbHIQxC-jOHcSqjwsQ8adkLYdXZ3sEZM6IYBvmGMN3GTt45SQ_vKf4rjHZCq97Dkkk5TlPl8FZhOnLwJ8c2XT6r9jLl4IC8te-QjPr87svkCKBKQelelvqf7n4yPXA-ym2kXTgjaXTGeuItgia9Nope5v_f5wiltzX9SkbPvg4Jw1Qp0a9cAC3g"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary"></div>
        </div>

        {/* Central visual wrapper */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center gap-12 text-white">
          {/* Marketing Column */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <h1 className="font-display-lg text-[32px] md:text-display-lg leading-tight mb-6 font-extrabold">
              Postular a una beca no tiene por qué ser un dolor de cabeza
            </h1>
            <p className="font-body-base text-body-base opacity-90 mb-8 max-w-lg mx-auto lg:mx-0">
              Olvídate de revisar cientos de páginas del gobierno o de las universidades a la vez. Aquí calculamos tus posibilidades reales y te decimos exactamente qué necesitas para ganar esa beca.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-3 text-left max-w-xs mx-auto lg:mx-0">
                <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                  <span className="material-symbols-outlined text-secondary-container">verified</span>
                </div>
                <div>
                  <h3 className="font-body-bold text-sm text-white">Todo centralizado</h3>
                  <p className="text-[12px] opacity-70">Conectamos todas las convocatorias vigentes.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left max-w-xs mx-auto lg:mx-0">
                <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                  <span className="material-symbols-outlined text-secondary-container">query_stats</span>
                </div>
                <div>
                  <h3 className="font-body-bold text-sm text-white">Tus tareas reales</h3>
                  <p className="text-[12px] opacity-70">Te ayudamos a armar tu mochila de documentos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Card Column */}
          <div className="w-full max-w-[440px] bg-surface text-on-surface rounded-2xl shadow-2xl overflow-hidden border border-border-subtle shrink-0">
            <div className="p-8 pb-4 text-center">
              <h2 className="font-headline-md text-[22px] text-on-background mb-1">Bienvenido de nuevo</h2>
              <p className="text-[13px] text-muted-slate">Tu camino hacia la excelencia académica comienza aquí</p>
            </div>

            <div className="p-4">
              {/* Tab Toggles */}
              <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-body-bold text-xs md:text-sm transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-secondary-container text-on-secondary-container shadow-sm font-bold"
                      : "bg-transparent text-muted-slate hover:bg-slate-200"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-body-bold text-xs md:text-sm transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-secondary-container text-on-secondary-container shadow-sm font-bold"
                      : "bg-transparent text-muted-slate hover:bg-slate-200"
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {/* Form Content */}
              <div className="px-4 pb-4">
                {activeTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label
                        className="font-label-caps text-[10px] text-muted-slate uppercase tracking-wider pl-1 font-bold"
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
                        className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-base"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label
                          className="font-label-caps text-[10px] text-muted-slate uppercase tracking-wider font-bold"
                          htmlFor="login-password"
                        >
                          Contraseña
                        </label>
                        <a href="#" className="text-primary font-body-bold text-xs hover:underline">
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
                        className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-base"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-secondary-container text-on-secondary-container font-body-bold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer text-center font-bold mt-2"
                    >
                      Entrar
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label
                        className="font-label-caps text-[10px] text-muted-slate uppercase tracking-wider pl-1 font-bold"
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
                        className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-base"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className="font-label-caps text-[10px] text-muted-slate uppercase tracking-wider pl-1 font-bold"
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
                        className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-base"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-secondary-container text-on-secondary-container font-body-bold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer text-center font-bold mt-2"
                    >
                      Crear cuenta
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-subtle"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-surface px-4 text-muted-slate uppercase tracking-[0.2em] font-semibold">
                      O continuar con
                    </span>
                  </div>
                </div>

                {/* OAuth Option */}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-border-subtle rounded-xl hover:bg-surface-container-low hover:border-primary/20 transition-all group cursor-pointer"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
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
                  <span className="font-body-bold text-xs md:text-sm text-on-surface font-bold">Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
