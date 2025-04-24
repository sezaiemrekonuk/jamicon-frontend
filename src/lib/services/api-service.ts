import { RegisterFormValues, LoginFormValues } from "../auth-schema";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokensDto;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getAuthHeaders(): HeadersInit {
    const accessToken = getCookie('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || response.statusText);
    }
    return response.json() as Promise<T>;
  }

  public async register(data: RegisterFormValues): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name
      })
    });

    const result = await this.handleResponse<{status: string; data: AuthResponse}>(response);
    this.saveTokens(result.data.tokens);
    return result.data;
  }

  public async login(data: LoginFormValues): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });

    const result = await this.handleResponse<{status: string; data: AuthResponse}>(response);
    this.saveTokens(result.data.tokens);
    return result.data;
  }

  public async getMe(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse<{status: string; data: {user: User}}>(response);
    return result.data.user;
  }

  public async logout(): Promise<void> {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  }

  public async refreshToken(): Promise<TokensDto> {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const result = await this.handleResponse<{status: string; data: {tokens: TokensDto}}>(response);
    this.saveTokens(result.data.tokens);
    return result.data.tokens;
  }

  public async verifyEmail(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/verify-email?token=${token}`, {
      method: 'GET'
    });

    const result = await this.handleResponse<{status: string; data: {user: User}}>(response);
    return result.data.user;
  }

  public async resendVerificationEmail(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    await this.handleResponse<{status: string; message: string}>(response);
  }

  private saveTokens(tokens: TokensDto): void {
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
  }
}

export const getApiService = (): ApiService => {
  return ApiService.getInstance();
}; 