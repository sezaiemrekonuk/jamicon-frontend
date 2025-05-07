import { apiClient } from './client';
import { Team, TeamWithMembers, CreateTeamData, UpdateTeamData, TeamInvitation } from '@/types/team';

const API_BASE = '/api/teams';

export const teamApi = {
  // Get all teams for the current user
  getUserTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get(`${API_BASE}/user`);
    return response.data.data.teams;
  },
  
  // Get a team by ID
  getTeamById: async (id: string): Promise<TeamWithMembers> => {
    const response = await apiClient.get(`${API_BASE}/${id}`);
    return response.data.data.team;
  },
  
  // Get a team by slug
  getTeamBySlug: async (slug: string): Promise<TeamWithMembers> => {
    const response = await apiClient.get(`${API_BASE}/slug/${slug}`);
    return response.data.data.team;
  },
  
  // Create a new team
  createTeam: async (data: CreateTeamData): Promise<Team> => {
    const response = await apiClient.post(API_BASE, data);
    return response.data.data.team;
  },
  
  // Update a team
  updateTeam: async (id: string, data: UpdateTeamData): Promise<Team> => {
    const response = await apiClient.put(`${API_BASE}/${id}`, data);
    return response.data.data.team;
  },
  
  // Delete a team
  deleteTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}`);
  },
  
  // Search teams
  searchTeams: async (query: string): Promise<Team[]> => {
    const response = await apiClient.get(`${API_BASE}/search`, {
      params: { query }
    });
    return response.data.data.teams;
  },

  // Get pending invitations for current user
  getUserPendingInvitations: async (): Promise<TeamInvitation[]> => {
    const response = await apiClient.get(`${API_BASE}/invitations/pending`);
    return response.data.data.invitations;
  },

  // Ahttps://example.com/logo.pngccept an invitation
  acceptInvitation: async (token: string): Promise<Team> => {
    const response = await apiClient.post(`${API_BASE}/invitations/${encodeURIComponent(token)}/accept`);
    return response.data.data.team;
  },

  // Reject an invitation
  rejectInvitation: async (token: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/invitations/${encodeURIComponent(token)}/reject`);
  },

  // Get pending invitations for a team
  getTeamPendingInvitations: async (teamId: string): Promise<{id: string, email: string, createdAt: Date, expiresAt: Date}[]> => {
    const response = await apiClient.get(`${API_BASE}/${teamId}/invitations/pending`);
    return response.data.data.invitations;
  },

  // Create an invitation
  createInvitation: async (invitationData: any): Promise<{invitationId: string, token: string}> => {
    const response = await apiClient.post(`${API_BASE}/invitations`, invitationData);
    return response.data.data;
  },

  // Cancel an invitation
  cancelInvitation: async (teamId: string, invitationId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${teamId}/invitations/${invitationId}`);
  },

  // Resend an invitation
  resendInvitation: async (teamId: string, invitationId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/${teamId}/invitations/${invitationId}/resend`);
  },

  // Transfer team ownership
  transferTeamOwnership: async (teamId: string, userId: string): Promise<Team> => {
    const response = await apiClient.patch(`${API_BASE}/${teamId}/transfer-ownership`, { userId, teamRole: 'ADMIN' });
    return response.data.data.team;
  },

  // Update member role
  updateMemberRole: async (teamId: string, roleData: any): Promise<Team> => {
    const response = await apiClient.patch(`${API_BASE}/${teamId}/members/role`, roleData);
    return response.data.data.team;
  },

  // Remove a member
  removeMember: async (teamId: string, memberId: string): Promise<Team> => {
    const response = await apiClient.delete(`${API_BASE}/${teamId}/members/${memberId}`);
    return response.data.data.team;
  }
}; 