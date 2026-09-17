'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { subscribeLoading } from '@/lib/loading';

type LoadingContextType = {
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeLoading(setLoading);
  }, []);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      startLoading,
      stopLoading,
    }),
    [startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFFAFA]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-3xl font-black tracking-tight text-[#000080]">
              HAMMR
            </h1>

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ADD8E6] border-t-[#000080]" />

            <p className="text-sm font-semibold text-[#6D8196]">Loading...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error('useLoading must be used inside LoadingProvider');
  }

  return context;
}
