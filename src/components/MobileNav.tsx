import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function MobileNav() {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    { to: "/dashboard", icon: "home", label: "Inicio" },
    { to: "/postulaciones", icon: "assignment", label: "Becas" },
    { to: "/buscar", icon: "search", label: "Buscar" },
    { to: "/documentos", icon: "backpack", label: "Mochila" },
    { to: "/asesor", icon: "smart_toy", label: "Asesor" },
  ];

  return (
    <nav
      className="flex items-center lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#fff",
        borderTop: "1px solid #e2e8f0",
        height: 60,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={{ flex: 1 }}
        >
          {({ isActive }) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "6px 0",
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 24,
                    height: 2,
                    background: "#0F2554",
                    borderRadius: "0 0 2px 2px",
                  }}
                />
              )}
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  color: isActive ? "#0F2554" : "#94a3b8",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  transition: "color 0.2s",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#0F2554" : "#94a3b8",
                  transition: "color 0.2s",
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
