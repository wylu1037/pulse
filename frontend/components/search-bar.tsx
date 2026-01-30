"use client";

import { useState } from "react";
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (term: string) => void;
  onServerSearch?: (term: string) => void;
}

export function SearchBar({ onSearch, onServerSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleServerSearch = () => {
    if (onServerSearch && searchTerm.trim()) {
      onServerSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search changelog..."
          value={searchTerm}
          onChange={handleChange}
          className="pl-9"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {onServerSearch && searchTerm && (
        <button
          onClick={handleServerSearch}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Search All
        </button>
      )}
    </div>
  )
}
