import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background font-body-base text-on-background min-h-screen flex flex-col">
      {/* Main Outer Wrapper */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <Sidebar />

        {/* Main Content Area — pb-16 leaves space for mobile bottom nav */}
        <main className="flex-1 lg:ml-64 p-3 sm:p-4 md:p-margin-desktop overflow-x-hidden pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation — visible only on mobile */}
      <MobileNav />
    </div>
  );
}
