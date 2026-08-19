import type { MetadataRoute } from "next";
import { appUrl } from "@/server/env";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl().replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/platform/", "/owner/", "/api/", "/staff/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
