"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { User, authApi } from "../api/auth";
import Loading from "@/components/loading";
import { LoginFormValues, RegisterFormValues } from "../auth-schema";
import { getCookie } from "cookies-next";

interface AuthContextType {
    status: "loading" | "unauthenticated" | "authenticated";
    user: User | null;
    signIn: (data: LoginFormValues) => Promise<User>;
    signUp: (data: RegisterFormValues) => Promise<User>;
    logout: () => Promise<void>;
    verifyEmail: (token: string) => Promise<User>;
    resendVerificationEmail: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<User>;
    updateUserInfo: (updatedUser: Partial<User>) => void;
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

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Check if access token exists
                const accessToken = getCookie('accessToken');
                if (!accessToken) {
                    setStatus("unauthenticated");
                    return;
                }

                // Fetch user data
                const userData = await authApi.getMe();
                setUser(userData);
                setStatus("authenticated");
            } catch (error) {
                // Try to refresh token if getting user fails
                try {
                    await authApi.refreshToken();
                    // Try getting user again after token refresh
                    const userData = await authApi.getMe();
                    setUser(userData);
                    setStatus("authenticated");
                } catch (refreshError) {
                    setUser(null);
                    setStatus("unauthenticated");
                }
            }
        };

        loadUser();
    }, []);

    const value: AuthContextType = {
        status,
        user,
        signIn: async (data: LoginFormValues) => {
            const response = await authApi.login(data);
            setUser(response.user);
            setStatus("authenticated");
            return response.user;
        },
        signUp: async (data: RegisterFormValues) => {
            const response = await authApi.register(data);
            setUser(response.user);
            setStatus("authenticated");
            return response.user;
        },
        logout: async () => {
            await authApi.logout();
            setUser(null);
            setStatus("unauthenticated");
        },
        verifyEmail: async (token: string) => {
            const user = await authApi.verifyEmail(token);
            // Only update user if this is the current user
            if (user && user.id === user?.id) {
                setUser({
                    ...user,
                    emailVerified: true
                });
            }
            return user;
        },
        resendVerificationEmail: async () => {
            await authApi.resendVerificationEmail();
        },
        forgotPassword: async (email: string) => {
            await authApi.forgotPassword(email);
        },
        resetPassword: async (token: string, password: string) => {
            const user = await authApi.resetPassword(token, password);
            return user;
        },
        updateUserInfo: (updatedUser: Partial<User>) => {
            setUser(currentUser => 
                currentUser ? { ...currentUser, ...updatedUser } : null
            );
        }
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
