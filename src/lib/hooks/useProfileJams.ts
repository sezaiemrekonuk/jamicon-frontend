import { useQuery } from '@tanstack/react-query';
import { jamApi } from '../api/jam';
import { Jam } from '@/types/jam';

/**
 * Fetches jams created by the given user, with optional enabling.
 */
export function useUserCreatedJams(userId: string, enabled: boolean = true) {
  return useQuery<Jam[], Error>({
    queryKey: ['userCreatedJams', userId],
    queryFn: () => jamApi.getUserCreatedJams(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Fetches jams attended by the given user, with optional enabling.
 */
export function useUserAttendedJams(userId: string, enabled: boolean = true) {
  return useQuery<Jam[], Error>({
    queryKey: ['userAttendedJams', userId],
    queryFn: () => jamApi.getUserAttendedJams(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
} 