"use client";

import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/constants";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { status } = useAuth();
  if (status === "authenticated") {
    const pathname = window.location.pathname;
    if (!pathname.includes("/login") && !pathname.includes("/register")) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Image src={BRAND.logo.src} alt={BRAND.logo.alt} width={BRAND.logo.width} height={BRAND.logo.height} />
        </Link>
      </div>
      {children}
    </div>
  );
} 