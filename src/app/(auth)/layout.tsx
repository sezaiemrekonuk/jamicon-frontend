"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Icons.logo className="h-6 w-6" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>
      {children}
    </div>
  );
} 