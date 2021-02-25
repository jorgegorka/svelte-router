/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
export function anyEmptyNestedRoutes(routeObject: any): any;
/**
 * Compare two routes ignoring named params
 * @param pathName string
 * @param routeName string
 **/
export function compareRoutes(pathName: any, routeName: any): any;
/**
 * Returns a boolean indicating if the name of path exists in the route based on the language parameter
 * @param pathName string
 * @param route object
 * @param language string
 **/
export function findLocalisedRoute(pathName: any, route: any, language: any): {
    exists: any;
    language: any;
};
/**
 * Return all the consecutive named param (placeholders) of a pathname
 * @param pathname
 **/
export function getNamedParams(pathName?: string): any;
/**
 * Split a pathname based on /
 * @param pathName
 * Private method
 **/
export function getPathNames(pathName: any): any;
/**
 * Return the first part of a pathname until the first named param is found
 * @param name
 **/
export function nameToPath(name?: string): any;
/**
 * Return the path name including query params
 * @param name
 **/
export function pathWithQueryParams(currentRoute: any): any;
/**
 * Return the path name excluding query params
 * @param name
 **/
export function pathWithoutQueryParams(currentRoute: any): any;
/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
export function removeExtraPaths(pathNames: any, basePathNames: any): any;
/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
export function removeSlash(pathName: any, position?: string): any;
/**
 * Returns the name of the route based on the language parameter
 * @param route object
 * @param language string
 **/
export function routeNameLocalised(route: any, language?: any): any;
/**
 * Return the path name excluding query params
 * @param name
 **/
export function startsWithNamedParam(currentRoute: any): any;
/**
 * Updates the base route path.
 * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
 *
 * @param basePath string
 * @param pathNames array
 * @param route object
 * @param language string
 **/
export function updateRoutePath(basePath: any, pathNames: any, route: any, language: any, convert?: boolean): {
    result: any;
    language: any;
};
