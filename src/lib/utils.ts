// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
