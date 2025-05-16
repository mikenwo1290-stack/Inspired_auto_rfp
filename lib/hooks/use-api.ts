import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

export function useApi<T>(key: string | null | Array<any>, url?: string | null) {
  // Support array-based cache keys for better SWR cache management
  const finalUrl = typeof key === 'string' ? key : url;
  
  const { data, error, isLoading, mutate } = useSWR<T>(
    key, 
    typeof finalUrl === 'string' ? () => fetcher(finalUrl) : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute deduping
      focusThrottleInterval: 60000, // Don't revalidate more than once per minute
      errorRetryCount: 3,
      loadingTimeout: 10000, // 10 seconds timeout
    }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

export function useOrganization(orgId: string | null, includeAll = false) {
  const params = includeAll ? '?include=all' : '';
  return useApi<any>(
    orgId ? ['organization', orgId, includeAll] : null,
    orgId ? `/api/organizations/${orgId}${params}` : null
  );
}

export function useOrganizationProjects(orgId: string | null) {
  return useApi<any[]>(
    orgId ? ['projects', orgId] : null,
    orgId ? `/api/projects?organizationId=${orgId}` : null
  );
}

export function useOrganizationMembers(orgId: string | null) {
  return useApi<any[]>(
    orgId ? ['organization-members', orgId] : null,
    orgId ? `/api/organizations/${orgId}/members` : null
  );
} 