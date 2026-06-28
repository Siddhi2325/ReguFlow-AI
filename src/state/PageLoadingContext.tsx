import React, { createContext, useContext, useState, useCallback } from "react";

interface PageLoadingContextValue {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PageLoadingContext = createContext<PageLoadingContextValue>({
  isLoading: false,
  setIsLoading: () => {},
});

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const setIsLoading = useCallback((loading: boolean) => {
    setLoadingCount((prev) => {
      const next = loading ? prev + 1 : Math.max(0, prev - 1);
      return next;
    });
  }, []);

  const isLoading = loadingCount > 0;

  return (
    <PageLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  return useContext(PageLoadingContext);
}
