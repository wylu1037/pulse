"use client";

import { useState } from "react";
import { Changelog } from "@/lib/api/pocketbase";
import { formatDate } from "@/lib/utils";
import { marked } from "marked";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as Icons from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CompactViewProps {
  changelogs: Changelog[];
}

export function CompactView({ changelogs }: CompactViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-muted/50 border-b border-border">
            <TableHead className="w-[15%] h-12 pl-4 text-muted-foreground">
              Version
            </TableHead>
            <TableHead className="w-[45%] h-12 text-muted-foreground">
              Title
            </TableHead>
            <TableHead className="w-[25%] h-12 text-muted-foreground">
              Tags
            </TableHead>
            <TableHead className="w-[15%] h-12 text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changelogs.map((changelog) => {
            const date = new Date(changelog.date)
            const formattedDate = formatDate(date)
            const isExpanded = expandedId === changelog.id

            return (
              <>
                <TableRow
                  key={changelog.id}
                  className="cursor-pointer hover:bg-accent/50 border-b border-border last:border-b-0"
                  onClick={() => toggleExpand(changelog.id)}
                >
                  <TableCell className="p-4 font-medium align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold border border-border rounded-md bg-background">
                      {changelog.version}
                    </span>
                  </TableCell>
                  <TableCell className="p-4 align-middle">
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
                  </TableCell>
                  <TableCell className="p-4 align-middle">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const allTags = changelog.expand?.tags
                          ? Array.isArray(changelog.expand.tags)
                            ? changelog.expand.tags
                            : [changelog.expand.tags]
                          : []
                        const tags = allTags.slice(0, 2)
                        return (
                          <>
                            {tags.map((tag) => {
                              const Icon = tag.icon
                                ? (
                                    Icons as unknown as Record<
                                      string,
                                      React.ComponentType<{
                                        className?: string
                                      }>
                                    >
                                  )[tag.icon]
                                : null
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
                            {allTags.length > 2 && (
                              <span className="h-6 px-2 text-xs font-medium text-muted-foreground">
                                +{allTags.length - 2}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground align-middle">
                    {formattedDate}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="p-0 border-t-0">
                      <div className="p-4 bg-muted/20 border-b border-border">
                        <div
                          className="prose dark:prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: marked(changelog.description),
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
