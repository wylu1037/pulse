"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChangelogList } from "@/components/changelog-list"
import { CompactView } from "@/components/compact-view"
import { CommandPalette } from "@/components/command-palette"
import { getTags } from "@/lib/api/changelogs"
import { useInfiniteChangelogs } from "@/lib/hooks/use-infinite-scroll"
import { useSiteConfig } from "@/lib/hooks/use-site-config"
import type { Tag } from "@/lib/api/pocketbase"
import { Loader2, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type ViewMode = "timeline" | "compact"

export default function HomePage() {
  const { siteTitle, logoUrl } = useSiteConfig()
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [serverSearch] = useState("") // setServerSearch reserved for future use
  const [viewMode, setViewMode] = useState<ViewMode>("timeline")

  const observerTarget = useRef<HTMLDivElement>(null)

  const { changelogs, loadMore, hasMore, loading, error } =
    useInfiniteChangelogs({
      tag: activeTag || undefined,
      search: serverSearch || undefined,
    })

  // Load tag list
  useEffect(() => {
    getTags().then(setTags).catch(console.error)
  }, [])

  // Client-side search filtering
  const filteredChangelogs = searchTerm
    ? changelogs.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : changelogs

  // Infinite scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto relative">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              )}
              <h1 className="text-3xl font-semibold tracking-tight">
                {siteTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    ctrlKey: true,
                  })
                  document.dispatchEvent(event)
                }}
                className="text-muted-foreground hover:text-foreground relative h-9 w-full justify-start bg-background text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64"
              >
                <span className="inline-flex">Search...</span>
                <Kbd className="pointer-events-none absolute right-[0.5rem] hidden h-5 select-none items-center gap-1 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </Kbd>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg mb-6">
            Loading failed: {error.message}
          </div>
        )}

        {filteredChangelogs.length === 0 && !loading ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <File />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm || serverSearch
                  ? "No matching changelog found"
                  : "No changelog available"}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm || serverSearch
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Create your first changelog entry to get started."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {viewMode === "timeline" ? (
              <ChangelogList changelogs={filteredChangelogs} />
            ) : (
              <CompactView changelogs={filteredChangelogs} />
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}
              {!loading && !hasMore && changelogs.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  No more items
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        changelogs={changelogs}
        tags={tags}
        activeTag={activeTag}
        viewMode={viewMode}
        onSearch={setSearchTerm}
        onTagSelect={setActiveTag}
        onViewChange={setViewMode}
      />
    </div>
  )
}
