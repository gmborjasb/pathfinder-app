import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { MobileNav } from "../components/MobileNav";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Inicio";
      case "/perfil":
        return "Perfil del Postulante";
      case "/buscar":
        return "Buscar Becas";
      case "/postulaciones":
        return "Mis Postulaciones";
      case "/documentos":
        return "Mochila de Documentos";
      case "/asesor":
        return "Motibot";
      case "/cv":
        return "Generador de CV";
      default:
        return "Pathfinder";
    }
  };

  return (
    <SidebarProvider>
      <div className="bg-bg-base font-sans text-text-primary h-screen flex flex-col w-full relative overflow-hidden">
        <div className="flex flex-1 w-full min-h-0">
          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          <SidebarInset className="flex-1 flex flex-col w-full overflow-x-hidden bg-bg-base min-h-0">
            <header className="flex h-14 shrink-0 items-center gap-1 border-b-2 border-border bg-white px-3 md:px-4">
              <SidebarTrigger className="hidden md:flex bg-main text-main-foreground border-2 border-border shadow-light hover:bg-main hover:-translate-y-boxShadowY hover:-translate-x-boxShadowX" />
              <div className="h-4 w-[2px] bg-border mx-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard" className="font-bold">
                      Pathfinder
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-black text-brand-blue">
                      {getBreadcrumbName(location.pathname)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            
            <main className="flex-1 min-h-0 p-2 md:p-4 mx-auto max-w-[1440px] w-full flex flex-col">
              {children}
            </main>
          </SidebarInset>
        </div>

        {/* Bottom Navigation — visible only on mobile */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
