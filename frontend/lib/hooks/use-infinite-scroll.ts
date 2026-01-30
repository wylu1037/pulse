"use client";

import { useState, useEffect, useCallback } from "react";
import { getChangelogs, type GetChangelogsOptions } from "@/lib/api/changelogs";
import type { Changelog } from "@/lib/api/pocketbase";

export function useInfiniteChangelogs(filters: GetChangelogsOptions = {}) {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getChangelogs(page, 20, filters);

      setChangelogs((prev) => [...prev, ...result.items]);
      setHasMore(page < result.totalPages);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load changelogs"));
    } finally {
      setLoading(false);
    }
  }, [page, filters, loading, hasMore]);

  // 重置状态（用于筛选条件变化时）
  const reset = useCallback(() => {
    setChangelogs([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // 初始加载
  useEffect(() => {
    reset();
  }, [filters.tag, filters.search, reset]);

  // 首次加载数据
  useEffect(() => {
    if (changelogs.length === 0 && hasMore && !loading) {
      loadMore();
    }
  }, [changelogs.length, hasMore, loading, loadMore]);

  return {
    changelogs,
    loadMore,
    hasMore,
    loading,
    error,
    reset,
  };
}
