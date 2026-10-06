'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_CONFIG, RestaurantConfig } from '@/lib/config-shared';

interface ConfigContextValue {
  config: RestaurantConfig;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  isLoading: false,
  refreshConfig: async () => {},
});

export function ConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: RestaurantConfig;
}) {
  const [config, setConfig] = useState<RestaurantConfig>(
    initialConfig || DEFAULT_CONFIG
  );
  const [isLoading, setIsLoading] = useState(!initialConfig);

  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setConfig(json.data);
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/config, falling back to defaults:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && json.data) {
            setConfig(json.data);
          }
        }
      } catch (e) {
        console.warn('Could not fetch /api/config, falling back to defaults:', e);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        config,
        isLoading,
        refreshConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
