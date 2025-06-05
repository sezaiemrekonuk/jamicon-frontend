import { useQuery } from '@tanstack/react-query';
import { userProfileApi } from '../api/userProfile';
import { UserProfile } from '@/types/user';

/**
 * Fetches the current user's profile.
 */
export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ['userProfile'],
    queryFn: () => userProfileApi.getCurrentUserProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 