"use client"
// providers

import { useEffect, useState } from "react";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import Loading from "@/components/loading";
import { Toaster } from "sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    
    const [isDomReady, setIsDomReady] = useState(false);
    useEffect(() => {
        if (window) {
            setIsDomReady(true);
        }
    }, []);

    return isDomReady ? (
        <AuthProvider>
            <ThemeProvider>
                {children}
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
    ) : (
        <Loading />
    );
};
