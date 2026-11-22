export type ApiRecord = Record<string, unknown>;

export function isApiRecord(value: unknown): value is ApiRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function firstString(...values: unknown[]): string {
  return values.find(
    (value): value is string => typeof value === "string"
  ) ?? "";
}

export function firstNumber(...values: unknown[]): number {
  const value = values.find(
    (candidate) => candidate !== undefined && candidate !== null
  );
  const number = Number(value ?? 0);

  return Number.isFinite(number) ? number : 0;
}
