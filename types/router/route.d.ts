export function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }: {
    routeInfo: any;
    path: any;
    routeNamedParams: any;
    urlParser: any;
    namedPath: any;
    language: any;
}): Readonly<{
    get: () => {
        name: any;
        component: any;
        hash: any;
        layout: any;
        queryParams: any;
        namedParams: any;
        path: any;
        language: any;
    };
    namedParams: () => any;
}>;
