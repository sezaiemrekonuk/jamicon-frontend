import { apiClient } from './client';
import { RegisterFormValues, LoginFormValues } from '../auth-schema';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  youtube: string | null;
  twitch: string | null;
  discord: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: string;
  userProfile?: UserProfile | null;
}

export interface AuthResponse {
  user: User;
  tokens: TokensDto;
}

const AUTH_BASE = '/api/auth';

const saveTokens = (tokens: TokensDto): void => {
  setCookie('accessToken', tokens.accessToken, { 
    maxAge: 60 * 60, // 1 hour
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  setCookie('refreshToken', tokens.refreshToken, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const authApi = {
  register: async (data: RegisterFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post(`${AUTH_BASE}/register`, {
      email: data.email,
      password: data.password,
      username: data.username
    });
    
    const result = response.data;
    saveTokens(result.data.tokens);
    return result.data;
  },

  login: async (data: LoginFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post(`${AUTH_BASE}/login`, {
      email: data.email,
      password: data.password
    });
    
    const result = response.data;
    saveTokens(result.data.tokens);
    return result.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get(`${AUTH_BASE}/me`);
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  },

  refreshToken: async (): Promise<TokensDto> => {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await apiClient.post(`${AUTH_BASE}/refresh-token`, { refreshToken });
    const tokens = response.data.data.tokens;
    saveTokens(tokens);
    return tokens;
  },

  verifyEmail: async (token: string): Promise<User> => {
    const response = await apiClient.get(`${AUTH_BASE}/verify-email?token=${token}`);
    return response.data.data.user;
  },

  resendVerificationEmail: async (): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/resend-verification`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
  },

  resetPassword: async (token: string, password: string): Promise<User> => {
    const response = await apiClient.post(`${AUTH_BASE}/reset-password`, { token, password });
    return response.data.data.user;
  },
}; 