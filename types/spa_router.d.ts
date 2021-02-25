/**
 * Object exposes one single property: activeRoute
 * @param routes  Array of routes
 * @param currentUrl current url
 * @param options configuration options
 **/
export function SpaRouter(routes: any, currentUrl: any, options?: {}): Readonly<{
    setActiveRoute: (updateBrowserHistory?: boolean) => any;
    findActiveRoute: () => {
        redirectTo: string;
    };
}>;
/**
 * Converts a route to its localised version
 * @param pathName
 **/
export function localisedRoute(pathName: any, language: any): {
    redirectTo: string;
};
/**
 * Updates the current active route and updates the browser pathname
 * @param pathName String
 * @param language String
 * @param updateBrowserHistory Boolean
 **/
export function navigateTo(pathName: any, language?: any, updateBrowserHistory?: boolean): any;
/**
 * Returns true if pathName is current active route
 * @param pathName String The path name to check against the current route.
 * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
 **/
export function routeIsActive(queryPath: any, includePath?: boolean): any;
