"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { User, Auth } from "firebase/auth";
import { getAuthService } from "../services/auth-service";
import Loading from "@/components/loading";

interface AppUser {
    status: "loading" | "unauthenticated" | "authenticated";
    user: User | null;
}

interface AuthContextType extends AppUser {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
    updateUserEmail: (email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
    deleteUserAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
    const authService = getAuthService();

    useEffect(() => {
        const unsubscribe = authService.getAuth().onAuthStateChanged((user: User | null) => {
            setUser(user);
            setStatus(user ? "authenticated" : "unauthenticated");
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        status,
        user,
        signIn: async (email: string, password: string) => {
            await authService.signIn(email, password);
        },
        signUp: async (email: string, password: string) => {
            await authService.signUp(email, password);
        },
        logout: async () => {
            await authService.logout();
        },
        resetPassword: async (email: string) => {
            await authService.resetPassword(email);
        },
        updateUserProfile: async (data: { displayName?: string; photoURL?: string }) => {
            await authService.updateUserProfile(data);
        },
        updateUserEmail: async (email: string) => {
            await authService.updateUserEmail(email);
        },
        updateUserPassword: async (password: string) => {
            await authService.updateUserPassword(password);
        },
        deleteUserAccount: async () => {
            await authService.deleteUserAccount();
        },
    };

    if (status === "loading") {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
