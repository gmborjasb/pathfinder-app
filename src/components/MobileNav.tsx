import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/dashboard",    icon: "home",      label: "Inicio"   },
  { to: "/postulaciones",icon: "assignment", label: "Becas"    },
  { to: "/buscar",       icon: "search",    label: "Buscar"   },
  { to: "/documentos",   icon: "backpack",  label: "Mochila"  },
  { to: "/asesor",       icon: "smart_toy", label: "Asesor"   },
];

export function MobileNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav
      className="flex items-stretch lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)]"
      style={{ height: 60, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegacion principal"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex flex-1"
        >
          {({ isActive }) => (
            <div className="relative flex flex-1 flex-col items-center justify-center gap-[3px] py-1.5">
              {/* Active top pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-b-full bg-[var(--brand)]" />
              )}

              {/* Icon */}
              <span
                className="material-symbols-outlined transition-colors duration-150"
                style={{
                  fontSize: 22,
                  color: isActive ? "var(--brand)" : "var(--slate-2)",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span
                className="text-[9px] leading-none transition-colors duration-150"
                style={{
                  color: isActive ? "var(--brand)" : "var(--slate-2)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
