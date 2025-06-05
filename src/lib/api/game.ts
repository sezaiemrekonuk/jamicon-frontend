import { apiClient } from './client';
import { GameDto } from '@/types/game';

const API_BASE = '/api/jams';
const GAMES_API = '/api/games';

export const gameApi = {
  /**
   * Upload a game build and optional photos to a jam
   */
  uploadGameToJam: async (jamId: string, formData: FormData): Promise<GameDto> => {
    const response = await apiClient.post(
      `${API_BASE}/${jamId}/games/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Get game by ID
   */
  getGameById: async (id: string): Promise<GameDto> => {
    const response = await apiClient.get(`${GAMES_API}/${id}`);
    return response.data;
  },

  /**
   * Get game by slug
   */
  getGameBySlug: async (slug: string): Promise<GameDto> => {
    const response = await apiClient.get(`${GAMES_API}/slug/${slug}`);
    return response.data;
  },
}; 