export function RouterPath({
  basePath,
  basePathName,
  pathNames,
  convert,
  currentLanguage,
}: {
  basePath: any;
  basePathName: any;
  pathNames: any;
  convert: any;
  currentLanguage: any;
}): Readonly<{
  basePathSameAsLocalised: () => boolean;
  updatedPath: (
    currentRoute: any
  ) => {
    result: any;
    language: any;
  };
  basePathNameWithoutNamedParams: () => any;
  localisedPathName: () => any;
  localisedRouteWithoutNamedParams: () => any;
  namedPath: () => any;
  pathNames: any;
  routeLanguage: () => any;
  routePath: () => string;
}>;
