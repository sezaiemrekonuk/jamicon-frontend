import { useQuery } from '@tanstack/react-query';
import { teamApi } from '../api/team';

/**
 * Fetches the teams of the current user, with caching.
 */
export function useUserTeams() {
  return useQuery({
    queryKey: ['userTeams'],
    queryFn: () => teamApi.getUserTeams(),
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
}

/**
 * Fetches team details by ID, with caching.
 */
export function useTeamById(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getTeamById(teamId),
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
}

/**
 * Searches teams by query string, caching disabled when query changes.
 */
export function useSearchTeams(query: string) {
  return useQuery({
    queryKey: ['searchTeams', query],
    queryFn: () => teamApi.searchTeams(query),
    enabled: Boolean(query),
  });
} 