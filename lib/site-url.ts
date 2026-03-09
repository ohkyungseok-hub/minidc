function normalizeSiteUrl(url: string) {
  let normalized = url.trim();

  if (!/^https?:\/\//.test(normalized)) {
    const isLocalhost =
      normalized.startsWith("localhost") ||
      normalized.startsWith("127.0.0.1");

    normalized = `${isLocalhost ? "http" : "https"}://${normalized}`;
  }

  return normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  return normalizeSiteUrl(siteUrl);
}
