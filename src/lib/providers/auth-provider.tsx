"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { 
    getAuth, 
    onAuthStateChanged, 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteUser
} from "firebase/auth";
import { getFirebaseInstance } from "../firebase";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const auth = getFirebaseInstance().auth;

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw error;
        }
    };

    const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
        if (!user?.user) throw new Error("No user logged in");
        try {
            await updateProfile(user.user, data);
        } catch (error) {
            throw error;
        }
    };

    const updateUserEmail = async (email: string) => {
        if (!user?.user) throw new Error("No user logged in");
        try {
            await updateEmail(user.user, email);
        } catch (error) {
            throw error;
        }
    };

    const updateUserPassword = async (password: string) => {
        if (!user?.user) throw new Error("No user logged in");
        try {
            await updatePassword(user.user, password);
        } catch (error) {
            throw error;
        }
    };

    const deleteUserAccount = async () => {
        if (!user?.user) throw new Error("No user logged in");
        try {
            await deleteUser(user.user);
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const status = user ? "authenticated" : "unauthenticated";
            setUser({ status, user });
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        ...user!,
        signIn,
        signUp,
        logout,
        resetPassword,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        deleteUserAccount
    };

    if (loading) {
        return <Loading />;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
