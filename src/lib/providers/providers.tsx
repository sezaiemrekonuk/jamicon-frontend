"use client"
// providers

import { useEffect, useState } from "react";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import Loading from "@/components/loading";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
    
    const [isDomReady, setIsDomReady] = useState(false);
    useEffect(() => {
        if (window) {
            setIsDomReady(true);
        }
    }, []);

    return isDomReady ? (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    ) : (
        <Loading />
    );
};
