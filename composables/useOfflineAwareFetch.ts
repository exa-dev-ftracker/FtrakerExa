export const useOfflineAwareFetch = () => {
  const { isOnline } = useOnline();
  const toast = useToast();

  const fetch = async <T = any>(
    url: string,
    options?: Parameters<typeof $fetch>[1]
  ): Promise<T | null> => {
    try {
      const response = await $fetch<T>(url, options);
      // Check if response came from cache (SW adds X-From-Cache header)
      if ((response as any).fromCache) {
        toast.add({
          icon: '📡',
          title: 'Using Cached Data',
          description: 'You are offline. Showing cached data.',
          color: 'yellow',
          timeout: 2000,
        });
      }
      return response;
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      // Check if offline
      if (!isOnline.value) {
        toast.add({
          icon: '📡',
          title: 'Offline',
          description: 'Cannot connect. Limited functionality available.',
          color: 'orange',
          timeout: 2000,
        });
      } else {
        toast.add({
          icon: '⚠️',
          title: 'Network Error',
          description: 'Failed to fetch data. Check your connection.',
          color: 'red',
          timeout: 3000,
        });
      }
      throw error;
    }
  };

  return {
    isOnline,
    fetch,
  };
};
