"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import Loading from "@/components/loading";
import { getCookie, setCookie } from "cookies-next";

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
  allowVisitOnce?: boolean;
  pageKey?: string;
}

/**
 * Protects routes that require authentication
 * Can also enforce a "visit once" policy using cookies
 */
export default function RequireAuth({
  children,
  redirectTo = "/login",
  allowVisitOnce = false,
  pageKey
}: RequireAuthProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [hasVisited, setHasVisited] = useState(false);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    // Loading state - wait for auth to finish
    if (status === "loading") return;

    // Not authenticated - redirect to login
    if (status === "unauthenticated") {
      router.push(redirectTo);
      return;
    }

    // For pages that should only be visited once
    if (allowVisitOnce && pageKey) {
      const visitKey = `page_visited_${pageKey}`;
      const hasVisitedBefore = getCookie(visitKey) === "true";

      if (hasVisitedBefore) {
        // User has already visited this page once, redirect to home
        router.push("/");
        return;
      } else {
        // Mark this page as visited and allow access this time
        setCookie(visitKey, "true", {
          maxAge: 365 * 24 * 60 * 60, // 1 year
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        setHasVisited(true);
        setCanAccess(true);
      }
    } else {
      // Regular protected page with no visit restrictions
      setCanAccess(true);
    }
  }, [status, router, redirectTo, allowVisitOnce, pageKey]);

  // Show loading state while authentication is in progress
  if (status === "loading" || !canAccess) {
    return <Loading />;
  }

  // Show the protected content
  return <>{children}</>;
} 