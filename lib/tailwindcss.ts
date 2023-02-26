export function cn(...classes: Array<string | boolean | undefined>) {
  return classes.filter(Boolean).join(" ");
}
