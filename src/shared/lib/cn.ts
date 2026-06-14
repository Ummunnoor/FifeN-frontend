/** Tiny class-name joiner — filters out falsy values so conditional classes stay readable. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
