"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { getSiteConfig } from "@/lib/api/changelogs"
import { pb } from "@/lib/api/pocketbase"
import { siteConfig as staticConfig } from "@/lib/site"
import type { SiteConfig as SiteConfigType } from "@/lib/api/pocketbase"

interface SiteConfigContextValue {
  siteTitle: string
  siteDescription: string
  logoUrl: string | null
  primaryColor: string | null
  isLoading: boolean
  rawConfig: SiteConfigType | null
}

export const SiteConfigContext = createContext<
  SiteConfigContextValue | undefined
>(undefined)

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfigType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      try {
        const dbConfig = await getSiteConfig()
        if (dbConfig) {
          setConfig(dbConfig)
        }
      } catch (error) {
        console.warn(
          "Failed to load site config, using static fallback:",
          error
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  // inject theme color
  useEffect(() => {
    const color = config?.primary_color
    if (color) {
      document.documentElement.style.setProperty("--primary", color)
    }
  }, [config?.primary_color])

  const logoUrl =
    config?.logo_url && config?.id
      ? `${pb.baseURL}/api/files/site_config/${config.id}/${config.logo_url}`
      : null

  const value: SiteConfigContextValue = {
    siteTitle: config?.site_title || staticConfig.name,
    siteDescription: config?.site_description || staticConfig.description,
    logoUrl,
    primaryColor: config?.primary_color || null,
    isLoading,
    rawConfig: config,
  }

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}
