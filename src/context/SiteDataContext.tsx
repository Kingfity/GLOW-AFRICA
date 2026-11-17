import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PublicSiteData } from '../shared/types';

interface SiteDataContextValue {
  data: PublicSiteData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextValue>({
  data: null,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const isPrivacyIsolatedRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/gbv') ||
      window.location.pathname.startsWith('/recovery'));

  const [data, setData] = useState<PublicSiteData | null>(null);
  const [loading, setLoading] = useState(!isPrivacyIsolatedRoute);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/gbv') ||
        window.location.pathname.startsWith('/recovery'))
    ) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/public-data');
      if (!res.ok) {
        throw new Error('Unable to load community information.');
      }
      const payload = (await res.json()) as PublicSiteData;
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load community information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPrivacyIsolatedRoute) return;
    void refresh();
  }, [refresh, isPrivacyIsolatedRoute]);

  return (
    <SiteDataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
