"use client";

import { Tag } from "@/lib/api/pocketbase";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface TagFilterProps {
  tags: Tag[];
  activeTag: string | null;
  onTagClick: (slug: string | null) => void;
}

export function TagFilter({ tags, activeTag, onTagClick }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagClick(null)}
        className={cn(
          "h-8 px-3 text-sm font-medium rounded-full border transition-colors",
          activeTag === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-foreground border-border hover:bg-accent"
        )}
      >
        All
      </button>
      {tags.map((tag) => {
        const Icon = tag.icon ? (Icons as any)[tag.icon] : null
        return (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag.slug)}
            className={cn(
              "h-8 px-3 text-sm font-medium rounded-full border transition-colors flex items-center gap-1.5",
              activeTag === tag.slug
                ? "border-transparent"
                : "bg-background border-border hover:bg-accent"
            )}
            style={
              activeTag === tag.slug && tag.color
                ? {
                    backgroundColor: tag.color + "20",
                    borderColor: tag.color,
                    color: tag.color,
                  }
                : {}
            }
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
