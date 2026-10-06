"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AccessLogFilterDraft } from "@/lib/parspack/access-log-filters";
import {
  isSeoFilterPresetActive,
  SEO_QUICK_FILTERS,
  type SeoQuickFilter,
} from "@/lib/parspack/seo-quick-filters";

type SeoQuickFiltersProps = {
  value: AccessLogFilterDraft;
  message?: string | null;
  onSelect: (preset: SeoQuickFilter) => void;
};

export function SeoQuickFilters({
  value,
  message,
  onSelect,
}: SeoQuickFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              SEO quick filters
            </span>
            <Badge variant="neutral">Shortcuts</Badge>
          </div>

          {SEO_QUICK_FILTERS.map((preset) => {
            const isActive =
              preset.kind === "filter" &&
              isSeoFilterPresetActive(preset, value);

            return (
              <Button
                key={preset.id}
                aria-pressed={preset.kind === "filter" ? isActive : undefined}
                className="h-8 rounded-full px-3 font-medium"
                size="sm"
                type="button"
                variant={isActive ? "primary" : "secondary"}
                onClick={() => onSelect(preset)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>

        {message ? (
          <p
            aria-live="polite"
            className="mt-3 rounded-[var(--radius-sm)] bg-accent-soft px-3 py-2 text-sm leading-5 text-foreground"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
