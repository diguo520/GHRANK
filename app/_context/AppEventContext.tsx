'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AppEventContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  authVersion: number;
  notifyAuthChange: () => void;
}

const AppEventContext = createContext<AppEventContextValue | null>(null);

export function useAppEvent() {
  const ctx = useContext(AppEventContext);
  if (!ctx) throw new Error('useAppEvent must be used within AppEventProvider');
  return ctx;
}

export function AppEventProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const notifyAuthChange = useCallback(() => setAuthVersion(prev => prev + 1), []);

  return (
    <AppEventContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, authVersion, notifyAuthChange }}>
      {children}
    </AppEventContext.Provider>
  );
}
