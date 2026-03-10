import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/seo";
import { TOPIC_SLUGS } from "@/config/topics";
import { createSupabaseServer } from "@/lib/supabase/server";

async function getPublishedPostIds(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) return [];

    const { data } = await supabase
      .from("posts")
      .select("id, updated_at")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(1000);

    return ((data ?? []) as { id: string }[]).map((p) => p.id);
  } catch {
    return [];
  }
}

async function getBoardSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) return [];

    const { data } = await supabase.from("boards").select("slug");
    return ((data ?? []) as { slug: string }[]).map((b) => b.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [postIds, boardSlugs] = await Promise.all([
    getPublishedPostIds(),
    getBoardSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/topics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/best`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hot`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = TOPIC_SLUGS.flatMap((slug) => [
    {
      url: `${SITE_URL}/topics/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/best/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ]);

  const boardPages: MetadataRoute.Sitemap = boardSlugs.map((slug) => ({
    url: `${SITE_URL}/boards/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.75,
  }));

  const postPages: MetadataRoute.Sitemap = postIds.map((id) => ({
    url: `${SITE_URL}/posts/${id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...topicPages, ...boardPages, ...postPages];
}
