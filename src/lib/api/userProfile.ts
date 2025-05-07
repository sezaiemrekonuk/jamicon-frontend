import { apiClient } from './client';
import { UserProfile, UpsertUserProfileFormData, JamExperience, JamExperienceFormData } from '@/types/user';

const API_BASE = '/api/user-profiles';

export const userProfileApi = {
  // Get the current user's profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(`${API_BASE}/me`);
    return response.data;
  },

  // Get a specific user's profile
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get(`${API_BASE}/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("You can only view your own profile");
      }
      throw error;
    }
  },

  // Update the current user's profile
  updateUserProfile: async (data: UpsertUserProfileFormData): Promise<UserProfile> => {
    const response = await apiClient.put(`${API_BASE}`, data);
    return response.data;
  },

  // Delete the current user's profile
  deleteUserProfile: async (): Promise<void> => {
    await apiClient.delete(`${API_BASE}`);
  },

  // Jam Experience API endpoints
  getUserJamExperiences: async (userId?: string): Promise<JamExperience[]> => {
    try {
      const endpoint = userId ? `${API_BASE}/jam-experiences/${userId}` : `${API_BASE}/jam-experiences/me`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("You can only view your own jam experiences");
      }
      throw error;
    }
  },

  createJamExperience: async (data: JamExperienceFormData): Promise<JamExperience> => {
    const response = await apiClient.post(`${API_BASE}/jam-experiences`, data);
    return response.data;
  },

  updateJamExperience: async (id: string, data: JamExperienceFormData): Promise<JamExperience> => {
    const response = await apiClient.put(`${API_BASE}/jam-experiences/${id}`, data);
    return response.data;
  },

  deleteJamExperience: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/jam-experiences/${id}`);
  }
}; 