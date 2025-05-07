import { apiClient } from './client';
import {
  CreateJamTeamInvitationData,
  CreateJamTeamRequestData,
  JamTeamInvitation,
  JamTeamRequest,
  TeamJam
} from '@/types/jam-team';
import { JamWithTeams } from '@/types/jam';

const API_BASE = '/api/jam-teams';

export const jamTeamApi = {
  // Invitations
  createJamTeamInvitation: async (jamId: string, data: CreateJamTeamInvitationData): Promise<JamTeamInvitation> => {
    const response = await apiClient.post(`${API_BASE}/jams/${jamId}/invitations`, data);
    return response.data.data;
  },

  getJamPendingInvitations: async (jamId: string): Promise<JamTeamInvitation[]> => {
    const response = await apiClient.get(`${API_BASE}/jams/${jamId}/invitations`);
    return Array.isArray(response.data.data) ? response.data.data : 
           (response.data.data?.invitations || []);
  },

  getTeamPendingInvitations: async (teamId: string): Promise<JamTeamInvitation[]> => {
    const response = await apiClient.get(`${API_BASE}/teams/${teamId}/invitations`);
    return Array.isArray(response.data.data) ? response.data.data : 
           (response.data.data?.invitations || []);
  },

  acceptJamTeamInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/invitations/${invitationId}/accept`);
  },

  rejectJamTeamInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/invitations/${invitationId}/reject`);
  },

  cancelJamTeamInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/invitations/${invitationId}`);
  },

  // Requests
  createJamTeamRequest: async (jamId: string, data: CreateJamTeamRequestData): Promise<JamTeamRequest> => {
    const response = await apiClient.post(`${API_BASE}/jams/${jamId}/requests`, data);
    return response.data.data;
  },

  getJamPendingRequests: async (jamId: string): Promise<JamTeamRequest[]> => {
    const response = await apiClient.get(`${API_BASE}/jams/${jamId}/requests`);
    return Array.isArray(response.data.data) ? response.data.data : 
           (response.data.data?.requests || []);
  },

  getTeamPendingRequests: async (teamId: string): Promise<JamTeamRequest[]> => {
    const response = await apiClient.get(`${API_BASE}/teams/${teamId}/requests`);
    return Array.isArray(response.data.data) ? response.data.data : 
           (response.data.data?.requests || []);
  },

  acceptJamTeamRequest: async (requestId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/requests/${requestId}/accept`);
  },

  rejectJamTeamRequest: async (requestId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/requests/${requestId}/reject`);
  },

  cancelJamTeamRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/requests/${requestId}`);
  },

  // Team's jams 
  getTeamJams: async (teamId: string): Promise<TeamJam[]> => {
    const response = await apiClient.get(`${API_BASE}/teams/${teamId}/jams`);
    return Array.isArray(response.data.data) ? response.data.data : 
           (response.data.data?.jams || []);
  },

  // Team management in jam
  removeTeamFromJam: async (jamId: string, teamId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/jams/${jamId}/teams/${teamId}`);
  }
}; 