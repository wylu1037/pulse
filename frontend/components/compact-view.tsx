"use client";

import { useState } from "react";
import { Changelog } from "@/lib/api/pocketbase";
import { formatDate } from "@/lib/utils";
import { marked } from "marked";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as Icons from "lucide-react";

interface CompactViewProps {
  changelogs: Changelog[];
}

export function CompactView({ changelogs }: CompactViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-2">Version</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Tags</div>
        <div className="col-span-2">Date</div>
      </div>

      {changelogs.map((changelog) => {
        const date = new Date(changelog.date)
        const formattedDate = formatDate(date)
        const isExpanded = expandedId === changelog.id

        return (
          <div
            key={changelog.id}
            className="border-b border-border last:border-b-0"
          >
            {/* Row */}
            <button
              onClick={() => toggleExpand(changelog.id)}
              className="w-full p-4 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-1 md:col-span-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold border border-border rounded">
                    {changelog.version}
                  </span>
                </div>

                <div className="col-span-1 md:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {changelog.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {changelog.expand?.tags?.slice(0, 2).map((tag) => {
                      const Icon = tag.icon ? (Icons as any)[tag.icon] : null
                      return (
                        <span
                          key={tag.id}
                          className="h-6 px-2 text-xs font-medium rounded-full border flex items-center gap-1"
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
                    {changelog.expand?.tags &&
                      changelog.expand.tags.length > 2 && (
                        <span className="h-6 px-2 text-xs font-medium text-muted-foreground">
                          +{changelog.expand.tags.length - 2}
                        </span>
                      )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground">
                  {formattedDate}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-border bg-muted/20">
                <div
                  className="prose dark:prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: marked(changelog.description),
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
