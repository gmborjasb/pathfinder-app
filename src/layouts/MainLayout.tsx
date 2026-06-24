import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: "var(--navy)" }}
    >
      <div className="flex max-w-[1440px] mx-auto">
        <Sidebar />
        <main className="flex-1 lg:ml-60 min-w-0 px-3 pt-3 pb-20 sm:px-4 sm:pt-4 md:px-8 md:pt-6 lg:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
