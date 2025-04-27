import { User } from './user';

export enum TeamRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  teamRole: TeamRole;
  user: {
    id: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
}

export interface CreateTeamRequest {
  name: string;
  slug: string;
}

export interface UpdateTeamRequest {
  name?: string;
  slug?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}

export interface CreateInvitationRequest {
  teamId: string;
  email: string;
}

export interface UpdateRoleRequest {
  userId: string;
  teamRole: TeamRole;
} 