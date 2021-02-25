import { activeRoute } from './store';
import { RouterCurrent } from './router/current';
import { RouterFinder } from './router/finder';
import { removeSlash } from './lib/utils';

const NotFoundPage = '/404.html';

let userDefinedRoutes = [];
let routerOptions = {};
let routerCurrent;

/**
 * Object exposes one single property: activeRoute
 * @param routes  Array of routes
 * @param currentUrl current url
 * @param options configuration options
 **/
const SpaRouter = (routes, currentUrl, options = {}) => {
  routerOptions = { ...options };
  if (typeof currentUrl === 'undefined' || currentUrl === '') {
    currentUrl = document.location.href;
  }

  routerCurrent = RouterCurrent(routerOptions.gaPageviews);

  currentUrl = removeSlash(currentUrl, 'trail');
  userDefinedRoutes = routes;

  const findActiveRoute = () => {
    let convert = false;

    if (routerOptions.langConvertTo) {
      routerOptions.lang = routerOptions.langConvertTo;
      convert = true;
    }

    return RouterFinder({ routes, currentUrl, routerOptions, convert }).findActiveRoute();
  };

  /**
   * Redirect current route to another
   * @param destinationUrl
   **/
  const navigateNow = (destinationUrl, updateBrowserHistory) => {
    if (typeof window !== 'undefined') {
      if (destinationUrl === NotFoundPage) {
        routerCurrent.setActive({ path: NotFoundPage }, updateBrowserHistory);
      } else {
        navigateTo(destinationUrl);
      }
    }

    return destinationUrl;
  };

  const setActiveRoute = (updateBrowserHistory = true) => {
    const currentRoute = findActiveRoute();
    if (currentRoute.redirectTo) {
      return navigateNow(currentRoute.redirectTo, updateBrowserHistory);
    }

    routerCurrent.setActive(currentRoute, updateBrowserHistory);
    activeRoute.set(currentRoute);

    return currentRoute;
  };

  return Object.freeze({
    setActiveRoute,
    findActiveRoute,
  });
};

/**
 * Converts a route to its localised version
 * @param pathName
 **/
const localisedRoute = (pathName, language) => {
  pathName = removeSlash(pathName, 'lead');
  routerOptions.langConvertTo = language;

  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute();
};

/**
 * Updates the current active route and updates the browser pathname
 * @param pathName String
 * @param language String
 * @param updateBrowserHistory Boolean
 **/
const navigateTo = (pathName, language = null, updateBrowserHistory = true) => {
  pathName = removeSlash(pathName, 'lead');

  if (language) {
    routerOptions.langConvertTo = language;
  }

  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute(
    updateBrowserHistory
  );
};

/**
 * Returns true if pathName is current active route
 * @param pathName String The path name to check against the current route.
 * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
 **/
const routeIsActive = (queryPath, includePath = false) => {
  return routerCurrent.isActive(queryPath, includePath);
};

if (typeof window !== 'undefined') {
  // Avoid full page reload on local routes
  window.addEventListener('click', (event) => {
    if (event.target.localName.toLowerCase() !== 'a') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    const sitePrefix = routerOptions.prefix ? `/${routerOptions.prefix.toLowerCase()}` : '';
    const targetHostNameInternal = event.target.pathname && event.target.host === window.location.host;
    const prefixMatchPath = sitePrefix.length > 1 ? event.target.pathname.startsWith(sitePrefix) : true;

    if (targetHostNameInternal && prefixMatchPath) {
      event.preventDefault();
      let navigatePathname = event.target.pathname + event.target.search;

      const destinationUrl = navigatePathname + event.target.search + event.target.hash;
      if (event.target.target === '_blank') {
        window.open(destinationUrl, 'newTab');
      } else {
        navigateTo(destinationUrl);
      }
    }
  });

  window.onpopstate = function (_event) {
    let navigatePathname = window.location.pathname + window.location.search + window.location.hash;

    navigateTo(navigatePathname, null, false);
  };
}

export { SpaRouter, localisedRoute, navigateTo, routeIsActive };
