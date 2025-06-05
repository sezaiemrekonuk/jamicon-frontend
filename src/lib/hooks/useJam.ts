import { useQuery } from '@tanstack/react-query';
import { jamApi } from '../api/jam';

/**
 * Fetches jam details by slug, with caching and revalidation.
 */
export function useJam(slug: string) {
  return useQuery({
    queryKey: ['jam', slug],
    queryFn: () => jamApi.getJamBySlug(slug),
    staleTime: 1000 * 60 * 5,    // 5 minutes
  });
} 