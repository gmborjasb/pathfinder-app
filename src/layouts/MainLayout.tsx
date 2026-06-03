import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background font-body-base text-on-background min-h-screen flex flex-col">
      {/* Main Outer Wrapper */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-md md:p-margin-desktop overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
