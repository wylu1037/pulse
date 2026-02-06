"use client"

import { Changelog } from "@/lib/api/pocketbase"
import { formatDate } from "@/lib/utils"
import { marked } from "marked"
import * as Icons from "lucide-react"

interface ChangelogListProps {
  changelogs: Changelog[]
}

export function ChangelogList({ changelogs }: ChangelogListProps) {
  return (
    <div className="relative">
      {changelogs.map((changelog) => {
        const date = new Date(changelog.date)
        const formattedDate = formatDate(date)

        return (
          <div key={changelog.id} className="relative">
            <div className="flex flex-col md:flex-row gap-y-6">
              {/* Left side - Date & Version */}
              <div className="md:w-48 flex-shrink-0">
                <div className="md:sticky md:top-8 pb-10">
                  <time className="text-sm font-medium text-muted-foreground block mb-3">
                    {formattedDate}
                  </time>

                  {changelog.version && (
                    <div className="inline-flex relative z-10 items-center justify-center w-10 h-10 text-foreground border border-border rounded-lg text-sm font-bold">
                      {changelog.version}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Content */}
              <div className="flex-1 md:pl-8 relative pb-10">
                {/* Vertical timeline line */}
                <div className="hidden md:block absolute top-2 left-0 w-px h-full bg-border">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute -translate-x-1/2 size-3 bg-primary rounded-full z-10" />
                </div>

                <div className="space-y-6">
                  <div className="relative z-10 flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-balance">
                      {changelog.title}
                    </h2>

                    {/* Tags */}
                    {(() => {
                      const tags = changelog.expand?.tags
                        ? Array.isArray(changelog.expand.tags)
                          ? changelog.expand.tags
                          : [changelog.expand.tags]
                        : []
                      if (tags.length === 0) return null
                      return (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const Icon = tag.icon
                              ? (
                                  Icons as unknown as Record<
                                    string,
                                    React.ComponentType<{ className?: string }>
                                  >
                                )[tag.icon]
                              : null
                            return (
                              <span
                                key={tag.id}
                                className="h-6 w-fit px-2 text-xs font-medium rounded-full border flex items-center gap-1 justify-center"
                                style={{
                                  backgroundColor: tag.color
                                    ? tag.color + "20"
                                    : undefined,
                                  borderColor: tag.color || undefined,
                                  color: tag.color || undefined,
                                }}
                              >
                                {Icon && <Icon className="h-3 w-3" />}
                                {tag.name}
                              </span>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                  <div
                    className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance"
                    dangerouslySetInnerHTML={{
                      __html: marked(changelog.description),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
