import type { Route } from './components/router';

/**
 * Object exposes one single property: activeRoute
 * @param routes Array of routes
 * @param currentUrl current url
 * @param options configuration options
 **/
export function SpaRouter(
  routes: Route[],
  currentUrl: undefined | string,
  options?: {}
): Readonly<{
  setActiveRoute: (updateBrowserHistory?: boolean) => any;
  findActiveRoute: () => {
    redirectTo: string;
  };
}>;
/**
 * Converts a route to its localised version
 * @param pathName String
 **/
export function localisedRoute(
  pathName: string,
  language: string
): {
  redirectTo: string;
};
/**
 * Updates the current active route and updates the browser pathname
 * @param pathName String
 * @param language String
 * @param updateBrowserHistory Boolean
 **/
export function navigateTo(pathName: string, language?: string, updateBrowserHistory?: boolean): void;
/**
 * Returns true if pathName is current active route
 * @param pathName String The path name to check against the current route.
 * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
 **/
export function routeIsActive(queryPath: string, includePath?: boolean): boolean;
