import { apiClient } from './client';
import { User } from '@/types/user';

const API_BASE = '/users';

export const userApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(`/auth/me`);
    return response.data.data.user;
  },

  // Get a specific user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(`${API_BASE}/${id}`);
    return response.data.data.user;
  },

  // Update user
  updateUser: async (id: string, data: any): Promise<User> => {
    const response = await apiClient.patch(`${API_BASE}/${id}`, data);
    return response.data.data.user;
  },

  // Upload avatar
  uploadAvatar: async (id: string, file: File): Promise<User> => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('avatar', file);

    // Set special headers for multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await apiClient.post(
      `${API_BASE}/${id}/avatar`,
      formData,
      config
    );
    
    return response.data.data.user;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}; 