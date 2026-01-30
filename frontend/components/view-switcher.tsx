"use client";

import { LayoutList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "timeline" | "compact";

interface ViewSwitcherProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center border border-border rounded-lg p-1 bg-background">
      <button
        onClick={() => onChange("timeline")}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          mode === "timeline"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("compact")}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          mode === "compact"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutList className="h-4 w-4" />
      </button>
    </div>
  )
}
