/** Tiny conditional className joiner — avoids a clsx dependency for the prototype port. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
