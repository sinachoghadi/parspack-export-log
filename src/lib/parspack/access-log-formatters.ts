const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatAccessLogTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return dateTimeFormatter.format(date).replace(",", "");
}

export function formatBytes(value: number | null): string {
  if (value === null) {
    return "—";
  }

  if (value === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const unitIndex = Math.max(
    0,
    Math.min(
      Math.floor(Math.log(Math.abs(value)) / Math.log(1024)),
      units.length - 1,
    ),
  );
  const scaledValue = value / 1024 ** unitIndex;
  const formattedValue =
    unitIndex === 0
      ? Math.round(scaledValue).toString()
      : Number(scaledValue.toFixed(1)).toString();

  return `${formattedValue} ${units[unitIndex]}`;
}
