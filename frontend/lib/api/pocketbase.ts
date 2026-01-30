import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "http://localhost:8090";
export const pb = new PocketBase(PB_URL);

// 禁用自动取消（适用于客户端应用）
pb.autoCancellation(false);

// TypeScript 接口定义
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  order: number;
  created: string;
  updated: string;
}

export interface Changelog {
  id: string;
  title: string;
  description: string;
  version: string;
  date: string;
  tags: string[]; // Tag IDs
  created: string;
  updated: string;
  expand?: {
    tags?: Tag[];
  };
}

export interface SiteConfig {
  id: string;
  site_title: string;
  site_description: string;
  logo_url?: string;
  primary_color?: string;
}

export type ChangelogListResponse = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Changelog[];
};
