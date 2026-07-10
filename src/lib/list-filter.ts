export function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function matchesQuery(query: string, values: Array<string | number | null | undefined>) {
  const normalizedQuery = query.trim().toLocaleLowerCase("en-AU");

  if (!normalizedQuery) return true;

  return values.some((value) =>
    String(value ?? "")
      .toLocaleLowerCase("en-AU")
      .includes(normalizedQuery),
  );
}
