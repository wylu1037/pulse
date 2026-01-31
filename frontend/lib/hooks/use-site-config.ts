"use client"

import { useContext } from "react"
import { SiteConfigContext } from "@/contexts/site-config-context"

/**
 * Hook to access site configuration
 * 
 * @throws Error if used outside SiteConfigProvider
 * @returns Site configuration values
 */
export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  
  if (context === undefined) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider")
  }
  
  return context
}
