import { useQuery } from '@tanstack/react-query';
import { jamApi } from '../api/jam';
import { Jam } from '@/types/jam';

/**
 * Filter options for fetching jams.
 */
export type JamFilter = 'all' | 'active' | 'featured' | 'trending';

/**
 * Fetches a list of jams based on the given filter.
 * - 'all' will fetch all jams
 * - 'active' will fetch active jams
 * - 'featured' will fetch featured jams
 * - 'trending' will fetch trending jams
 */
export function useJams(filter: JamFilter) {
  return useQuery<Jam[], Error>({
    queryKey: ['jams', filter],
    queryFn: () => {
      switch (filter) {
        case 'active':
          return jamApi.getActiveJams();
        case 'featured':
          return jamApi.getFeaturedJams();
        case 'trending':
          return jamApi.getTrendingJams();
        case 'all':
        default:
          return jamApi.getAllJams();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 