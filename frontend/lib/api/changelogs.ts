import { pb } from "./pocketbase";
import type { Changelog, ChangelogListResponse, Tag, SiteConfig } from "./pocketbase";

export interface GetChangelogsOptions {
  tag?: string;
  search?: string;
}

/**
 * 获取 Changelog 列表（分页）
 */
export async function getChangelogs(
  page = 1,
  perPage = 20,
  options: GetChangelogsOptions = {}
): Promise<ChangelogListResponse> {
  const filters: string[] = [];

  if (options.tag) {
    filters.push(`tags.slug ~ "${options.tag}"`);
  }

  if (options.search) {
    filters.push(
      `(title ~ "${options.search}" || description ~ "${options.search}")`
    );
  }

  const result = await pb.collection("changelogs").getList<Changelog>(page, perPage, {
    filter: filters.length > 0 ? filters.join(" && ") : undefined,
    sort: "-date,-created",
    expand: "tags",
  });

  return result;
}

/**
 * 获取所有标签
 */
export async function getTags(): Promise<Tag[]> {
  const records = await pb.collection("tags").getFullList<Tag>({
    sort: "order,name",
  });

  return records;
}

/**
 * 获取网站配置
 */
export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    const records = await pb.collection("site_config").getFullList<SiteConfig>();
    return records[0] || null;
  } catch (error) {
    console.error("Failed to fetch site config:", error);
    return null;
  }
}

/**
 * 获取特定版本的所有 changelogs
 */
export async function getChangelogsByVersion(version: string): Promise<Changelog[]> {
  const records = await pb.collection("changelogs").getFullList<Changelog>({
    filter: `version = "${version}"`,
    sort: "-date,-created",
    expand: "tags",
  });

  return records;
}

/**
 * 获取所有唯一版本号
 */
export async function getAllVersions(): Promise<string[]> {
  const records = await pb.collection("changelogs").getFullList<Changelog>({
    fields: "version,date",
    sort: "-date",
  });

  // 去重并保持顺序
  const versions = Array.from(new Set(records.map((r) => r.version)));
  return versions;
}
