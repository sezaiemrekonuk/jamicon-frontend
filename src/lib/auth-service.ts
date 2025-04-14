"use client";

import { LoginFormValues, RegisterFormValues } from "./auth-schema";

// Mock authentication service
export const authService = {
  login: async (data: LoginFormValues): Promise<{ success: boolean; message?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // This is just a mock implementation
    // In a real app, you would make an API call to your backend
    if (data.email === "test@example.com" && data.password === "password123") {
      return { success: true };
    }
    
    return { 
      success: false, 
      message: "Invalid email or password" 
    };
  },
  
  register: async (data: RegisterFormValues): Promise<{ success: boolean; message?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // This is just a mock implementation
    // In a real app, you would make an API call to your backend
    if (data.email === "taken@example.com") {
      return { 
        success: false, 
        message: "Email already in use" 
      };
    }
    
    return { success: true };
  }
}; 