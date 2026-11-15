import { QueryClient } from '@tanstack/react-query'

/**
 * Single cache for server data, shared by every page.
 *
 * - `staleTime`: data younger than 30s is shown without refetching, so moving
 *   between pages is instant. Older data is still shown immediately and
 *   revalidated in the background.
 * - Any successful write (POST/PUT/PATCH/DELETE) invalidates the whole cache —
 *   see the axios interceptor in `api.ts`. Mounted screens refetch right away,
 *   the rest refetch the next time they open. Blunt, but nothing can go stale.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
