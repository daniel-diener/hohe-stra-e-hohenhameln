import type { MetadataRoute } from "next";
import { objekte } from "@/lib/objekte";
import { seitenUrl } from "@/lib/seite";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (pfad: string) => new URL(pfad, seitenUrl).href;
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    ...objekte
      .filter((o) => o.status !== "verkauft")
      .map((o) => ({ url: url(`/objekte/${o.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: url("/impressum"), changeFrequency: "yearly", priority: 0.1 },
    { url: url("/datenschutz"), changeFrequency: "yearly", priority: 0.1 },
  ];
}
