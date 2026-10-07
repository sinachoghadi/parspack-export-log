import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  statusCode: number;
};

function getStatusVariant(statusCode: number) {
  if (statusCode >= 200 && statusCode <= 299) {
    return "success" as const;
  }

  if (statusCode >= 300 && statusCode <= 399) {
    return "accent" as const;
  }

  if (statusCode >= 400 && statusCode <= 499) {
    return "warning" as const;
  }

  if (statusCode >= 500 && statusCode <= 599) {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function StatusBadge({ statusCode }: StatusBadgeProps) {
  return <Badge variant={getStatusVariant(statusCode)}>{statusCode}</Badge>;
}
