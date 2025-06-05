import { User } from './user';

export type TeamRole = 'ADMIN' | 'MEMBER';

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
  createdAt: string;
  updatedAt: string;
  maxSize?: number | null;
  members: TeamMember[];
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface CreateTeamData {
  name: string;
  slug: string;
}

export interface UpdateTeamData {
  name?: string;
  slug?: string;
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
  email: string;
  teamId: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  team: Team;
  token: string;
  teamName: string;
  teamSlug: string;
}

export interface CreateInvitationRequest {
  teamId: string;
  email: string;
}

export interface UpdateRoleRequest {
  userId: string;
  teamRole: TeamRole;
} 