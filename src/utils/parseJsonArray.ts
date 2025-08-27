
export function parseJsonArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
        return undefined;
      } catch {
        return undefined;
      }
    }
    return [trimmed];
  }
  return undefined;
}
