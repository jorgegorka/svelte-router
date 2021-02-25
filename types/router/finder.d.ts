export function RouterFinder({ routes, currentUrl, routerOptions, convert }: {
    routes: any;
    currentUrl: any;
    routerOptions: any;
    convert: any;
}): Readonly<{
    findActiveRoute: () => {
        redirectTo: string;
    };
}>;
