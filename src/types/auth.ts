export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
    role: Role;
  };
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  username?: string;
}

export interface PasswordResetForm {
  email: string;
}

export interface PasswordUpdateForm {
  password: string;
  confirmPassword: string;
  token: string;
} 