"use client";

import { Navbar } from "@/components/navbar";
import { navigationConfig } from "@/config/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar items={navigationConfig} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 