import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const firebaseErrors = {
  "auth/email-already-in-use": "Email already in use",
  "auth/invalid-email": "Invalid email",
  "auth/weak-password": "Weak password",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Wrong password",
};