/** Splits a textarea's contents on commas and newlines into trimmed,
 * non-empty entries. */
export function parseList(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
