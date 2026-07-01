import * as React from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import { ProfileActions } from "./ProfileActions"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { profile } = useAuth();

  const [profileName, setProfileName] = useState("Estudiante");

  useEffect(() => {
    if (profile?.nombres) {
      setProfileName(profile.nombres.split(" ")[0]);
    } else {
      const stored = localStorage.getItem("pathfinder_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.nombres) setProfileName(parsed.nombres.split(" ")[0]);
        } catch (e) {}
      }
    }
  }, [profile]);

  const mainNav = [
    { title: "Inicio / Mi panel", url: "/dashboard", icon: "home" },
    { title: "Mis postulaciones", url: "/postulaciones", icon: "assignment" },
  ];

  const exploreNav = [
    { title: "Buscar becas", url: "/buscar", icon: "search" },
    { title: "Mochila Docs", url: "/documentos", icon: "backpack" },
    { title: "Motibot", url: "/asesor", icon: "smart_toy" },
  ];

  const toolsNav = [
    { title: "Genera tu CV", url: "/cv", icon: "description", badge: "NUEVO" },
  ];

  const navCls = (isActive: boolean) =>
    `flex items-center gap-4 transition-all border-2 rounded-xl h-11 px-4 w-full ${
      isActive
        ? "bg-blue-50 border-brand-blue text-brand-blue shadow-light hover:-translate-x-boxShadowX hover:-translate-y-boxShadowY"
        : "border-transparent text-text-secondary hover:bg-slate-100"
    }`;

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <Sidebar className="border-r-2 border-border" variant="sidebar">
      <SidebarHeader className="border-b-2 border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-main flex items-center justify-center text-main-foreground text-xl font-black shrink-0 shadow-light border-2 border-border">
            P
          </div>
          <div>
            <p className="text-lg font-black text-text-primary leading-tight">
              Pathfinder
            </p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5 font-bold">
              Portal postulante
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0 overflow-y-auto py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-4 mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={({ isActive }) => navCls(isActive)}>
                      <span className="material-symbols-outlined text-[20px] w-6 text-center shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-sm flex-1 font-black">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-4 mb-2">
            Explorar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {exploreNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={({ isActive }) => navCls(isActive)}>
                      <span className="material-symbols-outlined text-[20px] w-6 text-center shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-sm flex-1 font-black">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-4 mb-2">
            Herramientas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={({ isActive }) => navCls(isActive)}>
                      <span className="material-symbols-outlined text-[20px] w-6 text-center shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-sm flex-1 font-black">{item.title}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-brand-yellow border border-text-primary rounded text-text-primary shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-border p-4 pt-3 flex flex-col gap-0">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 w-full text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-main border-2 border-border flex items-center justify-center shrink-0 shadow-light">
            <span className="material-symbols-outlined text-[20px] text-main-foreground">
              person
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-text-primary truncate">{profileName}</p>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Estudiante
            </p>
          </div>
          <span className={`material-symbols-outlined text-[20px] text-text-tertiary transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>

        {showProfileMenu && (
          <div className="mt-3 animate-fade-in">
            <ProfileActions />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
