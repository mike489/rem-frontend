// Reading page search params.

type SearchParams = Record<string, string | string[] | undefined>;

/** A positive integer id from the search params (e.g. ?lead=12), or undefined. */
export function idParam(searchParams: SearchParams, key: string) {
  const raw = searchParams[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && /^[1-9]\d*$/.test(value) ? Number(value) : undefined;
}
