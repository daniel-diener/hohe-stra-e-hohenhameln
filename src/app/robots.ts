import type { MetadataRoute } from "next";
import { indexierbar, seitenUrl } from "@/lib/seite";

export default function robots(): MetadataRoute.Robots {
  if (!indexierbar) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/expose"] },
    sitemap: new URL("/sitemap.xml", seitenUrl).href,
  };
}
