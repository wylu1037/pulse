"use client";

import { useEffect, useState } from "react";
import { Changelog, Tag } from "@/lib/api/pocketbase";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Check, Search, List, Calendar, FileQuestion } from "lucide-react"
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface CommandPaletteProps {
  changelogs: Changelog[];
  tags: Tag[];
  activeTag: string | null;
  viewMode: "timeline" | "compact";
  onSearch: (query: string) => void;
  onTagSelect: (tagId: string | null) => void;
  onViewChange: (mode: "timeline" | "compact") => void;
}

export function CommandPalette({
  changelogs,
  tags,
  activeTag,
  viewMode,
  onSearch,
  onTagSelect,
  onViewChange,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // View shortcuts
      if (open) {
        if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onViewChange("timeline");
          setOpen(false);
        }
        if (e.key === "2" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onViewChange("compact");
          setOpen(false);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onViewChange]);

  // Filter changelogs based on search query
  const filteredChangelogs = searchQuery
    ? changelogs.filter(
        (changelog) =>
          changelog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          changelog.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  const handleValueChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="w-[400px]">
      <Command>
        <CommandInput
          placeholder="Type to search or filter..."
          value={searchQuery}
          onValueChange={handleValueChange}
        />
        <CommandList>
          <CommandEmpty>
            <Empty className="border-none py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileQuestion />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  Try searching for something else or adjusting your filters.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CommandEmpty>

          {/* Search Results */}
          {searchQuery && filteredChangelogs.length > 0 && (
            <>
              <CommandGroup heading="Search Results">
                {filteredChangelogs.slice(0, 5).map((changelog) => (
                  <CommandItem
                    key={changelog.id}
                    onSelect={() =>
                      handleSelect(() => {
                        // Scroll to changelog item
                        const element = document.getElementById(changelog.id)
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          })
                        }
                      })
                    }
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{changelog.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {changelog.version} •{" "}
                        {new Date(changelog.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Filter by Tag */}
          <CommandGroup heading="Filter by tag">
            <div className="flex flex-wrap gap-1 px-2 pb-2">
              {activeTag && (
                <CommandItem
                  onSelect={() => handleSelect(() => onTagSelect(null))}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md border border-dashed hover:border-solid transition-colors"
                >
                  Clear all
                </CommandItem>
              )}
              {tags.map((tag) => {
                const isActive = activeTag === tag.id

                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleSelect(() => onTagSelect(tag.id))}
                    className={cn(
                      "h-7 px-2 text-xs cursor-pointer rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {tag.name}
                  </CommandItem>
                )
              })}
            </div>
          </CommandGroup>

          <CommandSeparator />

          {/* View Mode */}
          <CommandGroup heading="View Mode">
            <CommandItem
              onSelect={() => handleSelect(() => onViewChange("timeline"))}
            >
              <Check
                className={`h-4 w-4 ${viewMode === "timeline" ? "opacity-100" : "opacity-0"}`}
              />
              <Calendar className="h-4 w-4" />
              <span>Timeline View</span>
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onViewChange("compact"))}
            >
              <Check
                className={`h-4 w-4 ${viewMode === "compact" ? "opacity-100" : "opacity-0"}`}
              />
              <List className="h-4 w-4" />
              <span>Compact View</span>
              <CommandShortcut>⌘2</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
