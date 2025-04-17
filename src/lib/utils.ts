import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const firebaseErrors = {
  "auth/email-already-in-use": "Email already in use",
  "auth/invalid-email": "Invalid email",
  "auth/weak-password": "Weak password",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Wrong password",
};