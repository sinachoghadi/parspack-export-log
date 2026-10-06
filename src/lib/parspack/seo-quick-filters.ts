import type { AccessLogFilterDraft } from "@/lib/parspack/access-log-filters";

type SeoQuickFilterField = "statusCode" | "uri" | "userAgent";

export type SeoFilterPreset = {
  id: string;
  kind: "filter";
  label: string;
  field: SeoQuickFilterField;
  value: string;
};

export type SeoInformationalPreset = {
  id: string;
  kind: "informational";
  label: string;
  message: string;
};

export type SeoQuickFilter = SeoFilterPreset | SeoInformationalPreset;

export const SEO_QUICK_FILTERS: readonly SeoQuickFilter[] = [
  {
    id: "googlebot",
    kind: "filter",
    label: "Googlebot",
    field: "userAgent",
    value: "Googlebot",
  },
  {
    id: "bingbot",
    kind: "filter",
    label: "Bingbot",
    field: "userAgent",
    value: "bingbot",
  },
  {
    id: "status-404",
    kind: "filter",
    label: "404",
    field: "statusCode",
    value: "404",
  },
  {
    id: "status-5xx",
    kind: "informational",
    label: "5xx",
    message: "Use an exact 5xx status code such as 500, 502, 503 or 504.",
  },
  {
    id: "robots-txt",
    kind: "filter",
    label: "robots.txt",
    field: "uri",
    value: "/robots.txt",
  },
  {
    id: "sitemap-xml",
    kind: "filter",
    label: "sitemap.xml",
    field: "uri",
    value: "/sitemap.xml",
  },
  {
    id: "crawlers",
    kind: "informational",
    label: "Crawlers",
    message: "Choose Googlebot or Bingbot for crawler-specific logs.",
  },
];

export function isSeoFilterPresetActive(
  preset: SeoFilterPreset,
  filters: AccessLogFilterDraft,
): boolean {
  return filters[preset.field] === preset.value;
}

export function toggleSeoFilterPreset(
  preset: SeoFilterPreset,
  filters: AccessLogFilterDraft,
): AccessLogFilterDraft {
  const nextValue = isSeoFilterPresetActive(preset, filters)
    ? ""
    : preset.value;

  return {
    ...filters,
    [preset.field]: nextValue,
  };
}
