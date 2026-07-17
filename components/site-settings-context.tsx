"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONTACT, type ContactSettings } from "@/lib/site";

/**
 * Iletisim + banka ayarlari (admin panelinden duzenlenebilir) root
 * layout'ta bir kez sunucuda okunup bu context ile tum client
 * bilesenlere dagitilir. Boylece her bilesen ayri ayri veri cekmez.
 */
const SiteSettingsContext = createContext<ContactSettings>(DEFAULT_CONTACT);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: ContactSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useContactSettings(): ContactSettings {
  return useContext(SiteSettingsContext);
}
