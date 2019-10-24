/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
function anyEmptyNestedRoutes(routeObject) {
  let result = false
  if (Object.keys(routeObject).length === 0) {
    return true
  }

  if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
    result = true
  } else if (routeObject.childRoute) {
    result = anyEmptyNestedRoutes(routeObject.childRoute)
  }

  return result
}

/**
 * Updates the base route path when route.name has a nested inside like /admin/teams
 * @param basePath string
 * @param pathNames array
 * @param route object
 **/
function compareRoutes(basePath, pathNames, route) {
  if (basePath === '/' || basePath.trim().length === 0) return basePath
  let basePathResult = basePath
  let routeName = route.name
  if (routeName[0] === '/') {
    routeName = routeName.slice(1)
  }
  if (basePathResult[0] === '/') {
    basePathResult = basePathResult.slice(1)
  }

  if (!route.childRoute) {
    let routeNames = routeName.split(':')[0]
    if (routeNames.slice(-1) === '/') {
      routeNames = routeNames.slice(0, -1)
    }
    routeNames = routeNames.split('/')
    routeNames.shift()
    routeNames.forEach(() => {
      const currentPathName = pathNames[0]
      if (currentPathName && route.name.includes(`${basePathResult}/${currentPathName}`)) {
        basePathResult += `/${pathNames.shift()}`
      } else {
        return basePathResult
      }
    })
    return basePathResult
  } else {
    return basePath
  }
}

/**
 * Return all the consecutive named param (placeholders) of a pathname
 * @param pathname
 **/
function getNamedParams(pathName = '') {
  if (pathName.trim().length === '') return []

  const namedUrlParams = getPathNames(pathName)
  return namedUrlParams.reduce((validParams, param, index) => {
    if (param[0] === ':') {
      validParams.push(param.slice(1))
    }
    return validParams
  }, [])
}

/**
 * Split a pathname based on /
 * @param pathName
 * Private method
 **/
function getPathNames(pathName) {
  if (pathName === '/' || pathName.trim().length === 0) return [pathName]
  if (pathName.slice(-1) === '/') {
    pathName = pathName.slice(0, -1)
  }
  if (pathName[0] === '/') {
    pathName = pathName.slice(1)
  }

  return pathName.split('/')
}

/**
 * Return the first part of a pathname until the first named param
 * @param name
 **/
function nameToPath(name = '') {
  let routeName
  if (name === '/' || name.trim().length === 0) return name
  if (name[0] === '/') {
    name = name.slice(1)
  }

  routeName = name.split(':')[0]
  if (routeName.slice(-1) === '/') {
    routeName = routeName.slice(0, -1)
  }

  return routeName.toLowerCase()
}

/**
 * Return the path name including query params
 * @param name
 **/
function pathWithSearch(currentRoute) {
  let queryParams = []
  if (currentRoute.queryParams) {
    for (let [key, value] of Object.entries(currentRoute.queryParams)) {
      queryParams.push(`${key}=${value}`)
    }
  }
  if (queryParams.length > 0) {
    return `${currentRoute.path}?${queryParams.join('&')}`
  } else {
    return currentRoute.path
  }
}

module.exports = {
  anyEmptyNestedRoutes,
  compareRoutes,
  getNamedParams,
  getPathNames,
  nameToPath,
  pathWithSearch
}
