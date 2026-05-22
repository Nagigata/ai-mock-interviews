export function getErrorMessage(error: unknown, fallback: string): string {
  if (error === null || error === undefined) return fallback;

  if (error instanceof Error) {
    const msg = error.message?.trim();
    return msg ? msg : fallback;
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed ? trimmed : fallback;
  }

  if (Array.isArray(error)) {
    return joinStrings(error, fallback);
  }

  if (typeof error === "object") {
    const obj = error as Record<string, unknown>;

    const fromMessage = stringOrJoined(obj.message);
    if (fromMessage) return fromMessage;

    if (typeof obj.error === "string") {
      const trimmed = obj.error.trim();
      if (trimmed) return trimmed;
    } else if (obj.error && typeof obj.error === "object") {
      const nested = obj.error as Record<string, unknown>;
      const nestedMessage = stringOrJoined(nested.message);
      if (nestedMessage) return nestedMessage;
    }
  }

  return fallback;
}

function stringOrJoined(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const joined = joinStringsOrNull(value);
    return joined;
  }
  return null;
}

function joinStrings(values: unknown[], fallback: string): string {
  return joinStringsOrNull(values) ?? fallback;
}

function joinStringsOrNull(values: unknown[]): string | null {
  const strings = values
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  if (strings.length === 0) return null;
  return strings.join("; ");
}
