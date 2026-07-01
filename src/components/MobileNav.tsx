import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ProfileActions } from "./ProfileActions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  if (!user) return null;

  const navItems = [
    { to: "/dashboard", icon: "home", label: "Inicio" },
    { to: "/postulaciones", icon: "assignment", label: "Becas" },
    { to: "/buscar", icon: "search", label: "Buscar" },
    { to: "/documentos", icon: "backpack", label: "Docs" },
    { to: "/asesor", icon: "smart_toy", label: "Asesor" },
    { to: "/cv", icon: "description", label: "CV" },
  ];

  return (
    <>
      <nav
        className="flex items-stretch md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-blue border-t-3 border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="flex-1 py-2 px-1">
            {({ isActive }) => (
              <div
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border-2 transition-all ${
                  isActive
                    ? "bg-brand-yellow border-border shadow-[2px_2px_0_#0f172a] text-text-primary"
                    : "border-transparent text-white/70"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className={`text-[9px] ${isActive ? "font-black" : "font-bold"}`}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
        <button onClick={() => setIsProfileOpen(true)} className="flex-1 py-2 px-1">
          <div className="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border-2 border-transparent text-white/70">
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-[9px] font-bold">Perfil</span>
          </div>
        </button>
      </nav>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="bottom" className="p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Perfil</SheetTitle>
          </SheetHeader>
          <ProfileActions onNavigate={() => setIsProfileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
