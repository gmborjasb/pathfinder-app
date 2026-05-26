import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState("Camila Fernanda López Ruiz");

  useEffect(() => {
    const loadProfile = () => {
      const stored = localStorage.getItem("pathfinder_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.nombres) {
            setProfileName(parsed.nombres);
          }
        } catch (e) {
          console.error("Error loading profile", e);
        }
      }
    };

    loadProfile();
    
    // Listen to changes to storage
    window.addEventListener("storage", loadProfile);
    // Custom event to update from same window
    window.addEventListener("profileUpdated", loadProfile);
    
    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, []);
  return (
    <aside className="fixed left-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-border-subtle py-lg gap-sm top-0">
      <div className="px-md mb-lg">
        <div className="flex items-center gap-sm p-md bg-surface-container-lowest rounded-xl border border-border-subtle">
          <div className="w-8 h-8 bg-[#0F52BA] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            P
          </div>
          <div>
            <p className="text-body-bold text-on-surface leading-tight font-['Plus_Jakarta_Sans']">
              Pathfinder
            </p>
            <p className="text-[10px] text-muted-slate font-label-caps uppercase tracking-wider">
              Portal Postulante
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col px-sm gap-xs flex-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">home</span>
          <span className="flex-1">Inicio / Mi Panel</span>
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">person</span>
          <span className="flex-1">Perfil del Postulante</span>
          <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">
            warning
          </span>
        </NavLink>

        <NavLink
          to="/postulaciones"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">assignment</span>
          <span className="flex-1">Mis Postulaciones</span>
          <span className="bg-surface-variant text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
            2
          </span>
        </NavLink>

        <NavLink
          to="/buscar"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">search</span>
          <span className="flex-1">Buscar Oportunidades</span>
        </NavLink>

        <NavLink
          to="/documentos"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">folder_shared</span>
          <span className="flex-1">Mochila de Documentos</span>
          <span className="bg-error-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            1
          </span>
        </NavLink>

        <NavLink
          to="/asesor"
          className={({ isActive }) =>
            `flex items-center gap-md p-md font-['Plus_Jakarta_Sans'] cursor-pointer transition-all ${isActive ? "bg-[#0F52BA]/10 text-[#0F52BA] border-l-4 border-[#0F52BA] font-body-bold" : "text-muted-slate hover:bg-surface-container-low hover:text-[#0F52BA] hover:pl-6"}`
          }
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="flex-1">Asesor IA</span>
        </NavLink>
      </nav>

      <div className="px-md mt-auto pb-sm">
        <div className="border-t border-border-subtle pt-md flex flex-col gap-sm">
          <div className="flex items-center gap-sm px-2">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-surface-container">
                <img
                  alt="Camila Lopez"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDzrNDQuzfW82Os1BmRGQQSTNt0GoDFXX8S0fGhD89YwCs-e-mkfiSg5m34AZfBYQCwrVi1MWIX0jTbnoIHp7VPXq88tHKVHf-R0Ubq0iuIDZgjAGJgGiCPbjlgIS5t_jykElFDNYPV5Fp75_2_3if7qeIBscLpFjjZK-w9zCycAu1q1v2To_WpTCO-K5XO4wi16C0WMIMstdCihKV1GUPbo1CxFHQUX9OrHjdkiunNEuJCXwr7KA7KECFhapD0RsjyOxTYZiWaw"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-body-bold text-on-surface truncate">
                  {profileName}
                </span>
                <button className="material-symbols-outlined text-[18px] text-muted-slate hover:text-primary transition-colors">
                  settings
                </button>
              </div>
              <p className="text-[12px] text-muted-slate truncate">
                Estudiante 5to Sec.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-sm text-error-red hover:bg-error-container/20 p-2 rounded-lg transition-colors font-body-bold text-body-sm mx-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
