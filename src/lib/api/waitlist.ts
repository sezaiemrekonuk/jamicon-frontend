import { apiClient } from './client';
import { WaitlistListing } from '@/types/waitlist';

const API_BASE = '/api/waitlists';

export const waitlistApi = {
  // Get waitlist entries for a specific jam
  getJamWaitlists: async (jamId: string, query?: string): Promise<WaitlistListing[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    const response = await apiClient.get(`${API_BASE}/jams/${jamId}${params.toString() ? `?${params.toString()}` : ''}`);
    // response.data: { status: 'success', data: WaitlistListing[] }
    return response.data.data;
  },

  // Get global waitlist entries
  getGlobalWaitlists: async (query?: string): Promise<WaitlistListing[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    const response = await apiClient.get(`${API_BASE}/global${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data.data;
  },

  // List an existing team on the global waitlist
  listTeam: async (teamId: string): Promise<WaitlistListing> => {
    const response = await apiClient.post(`${API_BASE}/teams/${teamId}`);
    return response.data.data;
  },

  // Create a waitlist entry for an existing team for a specific jam
  createJamWaitlist: async (jamId: string, data: { name: string; slug: string; maxSize?: number }): Promise<WaitlistListing> => {
    const response = await apiClient.post(`${API_BASE}/jams/${jamId}`, data);
    return response.data.data;
  },

  // Remove a team's global waitlist entry
  unlistTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/teams/${teamId}`);
  },

  // List an existing team on a specific jam waitlist
  listTeamForJam: async (jamId: string, teamId: string): Promise<WaitlistListing> => {
    const response = await apiClient.post(`${API_BASE}/jams/${jamId}/teams/${teamId}`);
    return response.data.data;
  }
}; 