import { NavLink, useNavigate } from "react-router-dom";

interface ProfileActionsProps {
  onNavigate?: () => void;
}

export function ProfileActions({ onNavigate }: ProfileActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1">
      <NavLink
        to="/perfil"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 h-10 rounded-xl border-2 border-border text-text-primary hover:bg-slate-50 transition-all text-sm font-black"
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        Modificar Perfil
      </NavLink>
      <button
        onClick={() => {
          onNavigate?.();
          navigate("/login");
        }}
        className="flex items-center gap-3 px-4 h-10 rounded-xl border-2 border-border text-danger-text hover:bg-danger-bg transition-all text-sm font-black cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Cerrar Sesión
      </button>
    </div>
  );
}
