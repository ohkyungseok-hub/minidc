import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/profile/",
          "/posts/new",
          "/posts/*/edit",
          "/api/",
          "/(auth)/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
