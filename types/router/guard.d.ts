export function RouterGuard(
  onlyIf: Partial<{
    guard: ReturnType<boolean>;
    redirect: string;
  }>
): Readonly<{
  valid: () => boolean;
  redirect: () => boolean;
  redirectPath: () => string;
}>;
