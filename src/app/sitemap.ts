import type { MetadataRoute } from "next";
import { objekteMitStand } from "@/lib/verkaufsstand";
import { seitenUrl } from "@/lib/seite";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const objekte = await objekteMitStand();
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
