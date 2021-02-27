export function RouterRoute({
  routeInfo,
  path,
  routeNamedParams,
  urlParser,
  namedPath,
  language,
}: {
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
    queryParams: Record<string, string>;
    namedParams: Record<string, string>;
    path: any;
    language: any;
  };
  namedParams: () => Record<string, string>;
}>;
