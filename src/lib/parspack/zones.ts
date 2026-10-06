import { parspackRequest } from "@/lib/parspack/client";
import type { ParspackZone } from "@/lib/parspack/types";

type GetZonesOptions = {
  token: string;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeZone(value: unknown): ParspackZone | null {
  if (!isRecord(value)) {
    return null;
  }

  const uuid = typeof value.uuid === "string" ? value.uuid.trim() : "";
  const targetDomain =
    typeof value.target_domain === "string" ? value.target_domain.trim() : "";

  if (!uuid || !targetDomain) {
    return null;
  }

  return {
    uuid,
    target_domain: targetDomain,
    id:
      typeof value.id === "string" || typeof value.id === "number"
        ? value.id
        : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    plan: typeof value.plan === "string" ? value.plan : undefined,
  };
}

function normalizeZones(value: unknown): ParspackZone[] {
  const zoneValues = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.zones)
      ? value.zones
      : null;

  if (!zoneValues) {
    throw new Error("Parspack API returned invalid zones data.");
  }

  return zoneValues
    .map(normalizeZone)
    .filter((zone): zone is ParspackZone => zone !== null);
}

export async function getZones({
  token,
  signal,
}: GetZonesOptions): Promise<ParspackZone[]> {
  const data = await parspackRequest<unknown>({
    token,
    path: "/zones",
    method: "GET",
    signal,
  });

  return normalizeZones(data);
}
