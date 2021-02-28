import { UrlParser } from './url_parser';

import { pathWithQueryParams, removeSlash } from '../lib/utils';

const RouterCurrent = (trackPage) => {
  const trackPageview = trackPage || false;
  let activeRoute = '';

  const setActive = (newRoute, updateBrowserHistory) => {
    activeRoute = newRoute.path;
    pushActiveRoute(newRoute, updateBrowserHistory);
  };

  const active = () => {
    return activeRoute;
  };

  /**
   * Returns true if pathName is current active route
   * @param pathName String The path name to check against the current route.
   * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
   **/
  const isActive = (queryPath, includePath = false) => {
    if (queryPath[0] !== '/') {
      queryPath = '/' + queryPath;
    }

    // remove query params for comparison
    let pathName = UrlParser(`http://fake.com${queryPath}`).pathname;
    let activeRoutePath = UrlParser(`http://fake.com${activeRoute}`).pathname;

    pathName = removeSlash(pathName, 'trail');

    activeRoutePath = removeSlash(activeRoutePath, 'trail');

    if (includePath) {
      return activeRoutePath.includes(pathName);
    } else {
      return activeRoutePath === pathName;
    }
  };

  const pushActiveRoute = (newRoute, updateBrowserHistory) => {
    if (typeof window !== 'undefined') {
      const pathAndSearch = pathWithQueryParams(newRoute);

      if (updateBrowserHistory) {
        window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
      }
      // Moving back in history does not update browser history but does update tracking.
      if (trackPageview) {
        gaTracking(pathAndSearch);
      }
    }
  };

  const gaTracking = (newPage) => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', newPage);
      ga('send', 'pageview');
    }
  };

  return Object.freeze({ active, isActive, setActive });
};

export { RouterCurrent };
