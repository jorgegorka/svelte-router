import type { Route } from '../components/router';
/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
export function anyEmptyNestedRoutes(routeObject: any): boolean;
/**
 * Compare two routes ignoring named params
 * @param pathName string
 * @param routeName string
 **/
export function compareRoutes(pathName: string, routeName: string): boolean;
/**
 * Returns a boolean indicating if the name of path exists in the route based on the language parameter
 * @param pathName string
 * @param route object
 * @param language string
 **/
export function findLocalisedRoute(
  pathName: string,
  route: any,
  language: string
): {
  exists: boolean;
  language: string;
};
/**
 * Return all the consecutive named param (placeholders) of a pathname
 * @param pathname
 **/
export function getNamedParams(pathName?: string): string[];
/**
 * Split a pathname based on /
 * @param pathName
 * Private method
 **/
export function getPathNames(pathName: string): string[];
/**
 * Return the first part of a pathname until the first named param is found
 * @param name
 **/
export function nameToPath(name?: string): string;
/**
 * Return the path name including query params
 * @param name
 **/
export function pathWithQueryParams(currentRoute: any): string;
/**
 * Return the path name excluding query params
 * @param name
 **/
export function pathWithoutQueryParams(currentRoute: any): string;
/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
export function removeExtraPaths(pathNames: string[], basePathNames: string): string[];
/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
export function removeSlash(pathName: string, position?: string): string;
/**
 * Returns the name of the route based on the language parameter
 * @param route object
 * @param language string
 **/
export function routeNameLocalised(route: Route, language?: null | string): string;
/**
 * Return the path name excluding query params
 * @param name
 **/
export function startsWithNamedParam(currentRoute: string): boolean;
/**
 * Updates the base route path.
 * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
 *
 * @param basePath string
 * @param pathNames array
 * @param route object
 * @param language string
 **/
export function updateRoutePath(
  basePath: string,
  pathNames: string[],
  route: Route,
  language: string,
  convert?: boolean
): {
  result: string;
  language: string;
};
