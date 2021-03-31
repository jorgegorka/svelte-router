/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
const anyEmptyNestedRoutes = (routeObject) => {
  let result = false;
  if (Object.keys(routeObject).length === 0) {
    return true;
  }

  if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
    result = true;
  } else if (routeObject.childRoute) {
    result = anyEmptyNestedRoutes(routeObject.childRoute);
  }

  return result;
};

/**
 * Compare two routes ignoring named params
 * @param pathName string
 * @param routeName string
 **/

const compareRoutes = (pathName, routeName) => {
  routeName = removeSlash(routeName);

  if (routeName.includes(':')) {
    return routeName.includes(pathName);
  } else {
    return routeName.startsWith(pathName);
  }
};

/**
 * Returns a boolean indicating if the name of path exists in the route based on the language parameter
 * @param pathName string
 * @param route object
 * @param language string
 **/

const findLocalisedRoute = (pathName, route, language) => {
  let exists = false;

  if (language) {
    return { exists: route.lang && route.lang[language] && route.lang[language].includes(pathName), language };
  }

  exists = compareRoutes(pathName, route.name);

  if (!exists && route.lang && typeof route.lang === 'object') {
    for (const [key, value] of Object.entries(route.lang)) {
      if (compareRoutes(pathName, value)) {
        exists = true;
        language = key;
      }
    }
  }

  return { exists, language };
};

/**
 * Return all the consecutive named param (placeholders) of a pathname
 * @param pathname
 **/
const getNamedParams = (pathName = '') => {
  if (pathName.trim().length === 0) return [];
  const namedUrlParams = getPathNames(pathName);
  return namedUrlParams.reduce((validParams, param) => {
    if (param[0] === ':') {
      validParams.push(param.slice(1));
    }

    return validParams;
  }, []);
};

/**
 * Split a pathname based on /
 * @param pathName
 * Private method
 **/
const getPathNames = (pathName) => {
  if (pathName === '/' || pathName.trim().length === 0) return [pathName];

  pathName = removeSlash(pathName, 'both');

  return pathName.split('/');
};

/**
 * Return the first part of a pathname until the first named param is found
 * @param name
 **/
const nameToPath = (name = '') => {
  let routeName;
  if (name === '/' || name.trim().length === 0) return name;
  name = removeSlash(name, 'lead');
  routeName = name.split(':')[0];
  routeName = removeSlash(routeName, 'trail');

  return routeName.toLowerCase();
};

/**
 * Return the path name excluding query params
 * @param name
 **/
const pathWithoutQueryParams = (currentRoute) => {
  const path = currentRoute.path.split('?');
  return path[0];
};

/**
 * Return the path name including query params
 * @param name
 **/
const pathWithQueryParams = (currentRoute) => {
  let queryParams = [];
  if (currentRoute.queryParams) {
    for (let [key, value] of Object.entries(currentRoute.queryParams)) {
      queryParams.push(`${key}=${value}`);
    }
  }

  const hash = currentRoute.hash ? currentRoute.hash : '';

  if (queryParams.length > 0) {
    return `${currentRoute.path}?${queryParams.join('&')}${hash}`;
  } else {
    return currentRoute.path + hash;
  }
};

/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/
const removeExtraPaths = (pathNames, basePathNames) => {
  const names = basePathNames.split('/');
  if (names.length > 1) {
    names.forEach(function (name, index) {
      if (name.length > 0 && index > 0) {
        pathNames.shift();
      }
    });
  }

  return pathNames;
};

/**
 * Returns a string with trailing or leading slash character removed
 * @param pathName string
 * @param position string - lead, trail, both
 **/

const removeSlash = (pathName, position = 'lead') => {
  if (position === 'trail' || position === 'both') {
    pathName = pathName.replace(/\/$/, '');
  }

  if (position === 'lead' || position === 'both') {
    pathName = pathName.replace(/^\//, '');
  }

  return pathName;
};

/**
 * Returns the name of the route based on the language parameter
 * @param route object
 * @param language string
 **/

const routeNameLocalised = (route, language = null) => {
  if (!language || !route.lang || !route.lang[language]) {
    return route.name;
  } else {
    return route.lang[language];
  }
};

/**
 * Return the path name excluding query params
 * @param name
 **/
const startsWithNamedParam = (currentRoute) => {
  const routeName = removeSlash(currentRoute);

  return routeName.startsWith(':');
};

/**
 * Updates the base route path.
 * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
 *
 * @param basePath string
 * @param pathNames array
 * @param route object
 * @param language string
 **/

const updateRoutePath = (basePath, pathNames, route, language, convert = false) => {
  if (basePath === '/' || basePath.trim().length === 0) return { result: basePath, language: null };

  let basePathResult = basePath;
  let routeName = route.name;
  let currentLanguage = language;

  if (convert) {
    currentLanguage = '';
  }

  routeName = removeSlash(routeName);
  basePathResult = removeSlash(basePathResult);

  if (!route.childRoute) {
    let localisedRoute = findLocalisedRoute(basePathResult, route, currentLanguage);

    if (localisedRoute.exists && convert) {
      basePathResult = routeNameLocalised(route, language);
    }

    let routeNames = routeName.split(':')[0];
    routeNames = removeSlash(routeNames, 'trail');
    routeNames = routeNames.split('/');
    routeNames.shift();
    routeNames.forEach(() => {
      const currentPathName = pathNames[0];
      localisedRoute = findLocalisedRoute(`${basePathResult}/${currentPathName}`, route, currentLanguage);

      if (currentPathName && localisedRoute.exists) {
        if (convert) {
          basePathResult = routeNameLocalised(route, language);
        } else {
          basePathResult = `${basePathResult}/${currentPathName}`;
        }
        pathNames.shift();
      } else {
        return { result: basePathResult, language: localisedRoute.language };
      }
    });
    return { result: basePathResult, language: localisedRoute.language };
  } else {
    return { result: basePath, language: currentLanguage };
  }
};

export {
  anyEmptyNestedRoutes,
  compareRoutes,
  findLocalisedRoute,
  getNamedParams,
  getPathNames,
  nameToPath,
  pathWithQueryParams,
  pathWithoutQueryParams,
  removeExtraPaths,
  removeSlash,
  routeNameLocalised,
  startsWithNamedParam,
  updateRoutePath,
};
