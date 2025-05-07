// Types for Jam Team Invitations and Requests

// Form data for creating a team invitation to a jam
export interface CreateJamTeamInvitationData {
  teamId: string;
  message?: string;
}

// Form data for creating a team request to join a jam
export interface CreateJamTeamRequestData {
  teamId: string;
  message?: string;
}

// Response object for a jam team invitation
export interface JamTeamInvitation {
  id: string;
  jamId: string;
  teamId: string;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  jamName: string;
  jamSlug: string;
  teamName: string;
  teamSlug: string;
}

// Response object for a jam team request
export interface JamTeamRequest {
  id: string;
  jamId: string;
  teamId: string;
  message: string | null;
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  jamName: string;
  jamSlug: string;
  teamName: string;
  teamSlug: string;
}

// Team's jam participation status
export enum TeamJamStatus {
  PARTICIPATING = 'participating',
  INVITED = 'invited',
  REQUESTED = 'requested',
  PAST = 'past'
}

// Response object for a team's jams
export interface TeamJam {
  jamId: string;
  jamName: string;
  jamSlug: string;
  status: TeamJamStatus;
  startDate: string;
  endDate: string;
  requestId?: string;
  invitationId?: string;
} 