"use client";

import { Navbar } from "@/components/navbar";
import { navigationConfig } from "@/config/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { redirect } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { status } = useAuth();

  if (status === "unauthenticated") {
    // redirect to login page with redirect url
    redirect("/login?redirect=" + window.location.pathname);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar items={navigationConfig} />
      <main className="flex-1 mx-auto container">
        {children}
      </main>
    </div>
  );
} 