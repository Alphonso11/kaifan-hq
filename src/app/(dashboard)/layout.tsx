"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useUser } from "@/hooks/use-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Render the shell immediately. Access is already enforced server-side by
  // middleware, and the role only drives which sidebar links show — so we
  // never block the whole page on the client-side auth check (which could
  // otherwise leave the app stuck on a spinner).
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={user?.role || "guest"}
        canHost={user?.can_host || user?.role === "super_admin"}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
