export function RouterGuard(onlyIf: any): Readonly<{
    valid: () => boolean;
    redirect: () => boolean;
    redirectPath: () => string;
}>;
