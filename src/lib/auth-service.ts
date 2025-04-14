"use client";

import { LoginFormValues, RegisterFormValues } from "./auth-schema";
import { 
    User,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteUser
} from "firebase/auth";
import { getFirebaseInstance } from "./firebase";

export class AuthService {
    private static instance: AuthService;
    private auth: Auth;

    private constructor() {
        this.auth = getFirebaseInstance().getAuth();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public getAuth(): Auth {
        return this.auth;
    }

    public async signIn(email: string, password: string): Promise<User> {
        const result = await signInWithEmailAndPassword(this.auth, email, password);
        return result.user;
    }

    public async signUp(email: string, password: string): Promise<User> {
        const result = await createUserWithEmailAndPassword(this.auth, email, password);
        return result.user;
    }

    public async logout(): Promise<void> {
        await signOut(this.auth);
    }

    public async resetPassword(email: string): Promise<void> {
        await sendPasswordResetEmail(this.auth, email);
    }

    public async updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
        if (!this.auth.currentUser) throw new Error("No user logged in");
        await updateProfile(this.auth.currentUser, data);
    }

    public async updateUserEmail(email: string): Promise<void> {
        if (!this.auth.currentUser) throw new Error("No user logged in");
        await updateEmail(this.auth.currentUser, email);
    }

    public async updateUserPassword(password: string): Promise<void> {
        if (!this.auth.currentUser) throw new Error("No user logged in");
        await updatePassword(this.auth.currentUser, password);
    }

    public async deleteUserAccount(): Promise<void> {
        if (!this.auth.currentUser) throw new Error("No user logged in");
        await deleteUser(this.auth.currentUser);
    }

    public getCurrentUser(): User | null {
        return this.auth.currentUser;
    }
}

export const getAuthService = (): AuthService => {
    return AuthService.getInstance();
}; 