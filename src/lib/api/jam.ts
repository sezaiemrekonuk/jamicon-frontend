import { apiClient } from './client';
import {
  Jam,
  JamWithTeams,
  JamWithGames,
  JamWithTeamsAndGames,
  CreateJamFormData,
  UpdateJamFormData,
  AttachTeamToJamData,
  SubmitGameToJamData,
  Visibility
} from '@/types/jam';

const API_BASE = '/api/jams';

export const jamApi = {
  // Get all jams with optional filtering
  getAllJams: async (options?: {
    featured?: boolean;
    trending?: boolean;
    visibility?: Visibility;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.featured !== undefined) {
      params.append('featured', options.featured.toString());
    }
    
    if (options?.trending !== undefined) {
      params.append('trending', options.trending.toString());
    }
    
    if (options?.visibility) {
      params.append('visibility', options.visibility);
    }
    
    if (options?.active !== undefined) {
      params.append('active', options.active.toString());
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}?${params.toString()}`);
    return response.data;
  },
  
  // Get active jams
  getActiveJams: async (options?: {
    featured?: boolean;
    visibility?: Visibility;
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.featured !== undefined) {
      params.append('featured', options.featured.toString());
    }
    
    if (options?.visibility) {
      params.append('visibility', options.visibility);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}/active?${params.toString()}`);
    return response.data;
  },
  
  // Get featured jams
  getFeaturedJams: async (options?: {
    active?: boolean;
    visibility?: Visibility;
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.active !== undefined) {
      params.append('active', options.active.toString());
    }
    
    if (options?.visibility) {
      params.append('visibility', options.visibility);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}/featured?${params.toString()}`);
    return response.data;
  },
  
  // Get trending jams
  getTrendingJams: async (options?: {
    active?: boolean;
    visibility?: Visibility;
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.active !== undefined) {
      params.append('active', options.active.toString());
    }
    
    if (options?.visibility) {
      params.append('visibility', options.visibility);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}/trending?${params.toString()}`);
    return response.data;
  },
  
  // Get a jam by ID
  getJamById: async (id: string): Promise<JamWithTeamsAndGames> => {
    const response = await apiClient.get(`${API_BASE}/id/${id}`);
    return response.data;
  },
  
  // Get a jam by slug
  getJamBySlug: async (slug: string): Promise<JamWithTeamsAndGames> => {
    const response = await apiClient.get(`${API_BASE}/slug/${slug}`);
    return response.data;
  },
  
  // Get jams created by the current user
  getUserJams: async (): Promise<Jam[]> => {
    const response = await apiClient.get(`${API_BASE}/my-jams`);
    return response.data;
  },
  
  // Get jams created by a specific user
  getUserCreatedJams: async (userId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}/user/${userId}/created?${params.toString()}`);
    return response.data;
  },
  
  // Get jams that a user is participating in
  getUserAttendedJams: async (userId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Jam[]> => {
    const params = new URLSearchParams();
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const response = await apiClient.get(`${API_BASE}/user/${userId}/attended?${params.toString()}`);
    return response.data;
  },
  
  // Get jams for a team
  getTeamJams: async (teamId: string): Promise<Jam[]> => {
    const response = await apiClient.get(`${API_BASE}/team/${teamId}`);
    return response.data;
  },
  
  // Create a new jam
  createJam: async (data: CreateJamFormData): Promise<Jam> => {
    const response = await apiClient.post(API_BASE, data);
    return response.data;
  },
  
  // Update a jam
  updateJam: async (id: string, data: UpdateJamFormData): Promise<Jam> => {
    const response = await apiClient.put(`${API_BASE}/${id}`, data);
    return response.data;
  },
  
  // Delete a jam
  deleteJam: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}`);
  },
  
  // Attach a team to a jam
  attachTeamToJam: async (jamId: string, data: AttachTeamToJamData): Promise<JamWithTeams> => {
    const response = await apiClient.post(`${API_BASE}/${jamId}/teams`, data);
    return response.data;
  },
  
  // Detach a team from a jam
  detachTeamFromJam: async (jamId: string, teamId: string): Promise<JamWithTeams> => {
    const response = await apiClient.delete(`${API_BASE}/${jamId}/teams/${teamId}`);
    return response.data;
  },
  
  // Submit a game to a jam
  submitGameToJam: async (jamId: string, data: SubmitGameToJamData): Promise<JamWithGames> => {
    const response = await apiClient.post(`${API_BASE}/${jamId}/games`, data);
    return response.data;
  },
  
  // Remove a game from a jam
  removeGameFromJam: async (jamId: string, gameId: string): Promise<JamWithGames> => {
    const response = await apiClient.delete(`${API_BASE}/${jamId}/games/${gameId}`);
    return response.data;
  },
  
  // Toggle game highlight status
  toggleGameHighlight: async (jamId: string, gameId: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/${jamId}/games/${gameId}/highlight`);
  }
}; 