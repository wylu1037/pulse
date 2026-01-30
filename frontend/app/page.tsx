"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"
import { TagFilter } from "@/components/tag-filter"
import { ViewSwitcher, type ViewMode } from "@/components/view-switcher"
import { ChangelogList } from "@/components/changelog-list"
import { CompactView } from "@/components/compact-view"
import { getTags } from "@/lib/api/changelogs"
import { useInfiniteChangelogs } from "@/lib/hooks/use-infinite-scroll"
import type { Tag } from "@/lib/api/pocketbase"
import { Loader2, FileQuestion, File } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function HomePage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [serverSearch, setServerSearch] = useState("")
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

  const handleTagClick = (slug: string | null) => {
    setActiveTag(slug)
    setServerSearch("")
    setSearchTerm("")
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleServerSearch = (term: string) => {
    setServerSearch(term)
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto relative">
          <div className="p-3 flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border/50 bg-background">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-4 space-y-4">
          <SearchBar
            onSearch={handleSearch}
            onServerSearch={handleServerSearch}
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TagFilter
              tags={tags}
              activeTag={activeTag}
              onTagClick={handleTagClick}
            />
            <ViewSwitcher mode={viewMode} onChange={setViewMode} />
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
    </div>
  )
}
