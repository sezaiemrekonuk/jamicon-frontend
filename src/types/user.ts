import { Role } from './auth';

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
  jamExperiences?: JamExperience[];
}

export interface JamExperience {
  id: string;
  userId: string;
  jamName: string;
  jamUrl: string;
  position: number;
  description: string | null;
  entryDate: Date;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: Role;
  userProfile?: UserProfile | null;
}

export interface UpsertUserProfileFormData {
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  website?: string | null;
  github?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  twitch?: string | null;
  discord?: string | null;
}

export interface JamExperienceFormData {
  id?: string;
  jamName: string;
  jamUrl: string;
  position: number;
  description?: string | null;
  entryDate: Date;
} 