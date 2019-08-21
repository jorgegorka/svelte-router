const { UrlParser } = require('url-params-parser')

/**
 * Returns an array with all routes flattened and a full route path
 * @param routeObject
 * @param basePath
 **/

function addAbsoluteRoutes(routes, basePath = '') {
  let fullRoutes = []
  routes.forEach(function(route) {
    const routePath = `${basePath}/${stripFirstSlash(route.name)}`
    if (route.nestedRoutes && route.nestedRoutes.length > 0) {
      fullRoutes.push({ ...route, fullPath: routePath })
      fullRoutes = [...fullRoutes, ...addAbsoluteRoutes(route.nestedRoutes, routePath)]
    } else {
      fullRoutes.push({ ...route, fullPath: routePath })
    }
  })

  return fullRoutes
}

/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
const anyEmptyNestedRoutes = routeObject => {
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
 * Returns true if routes are comparable
 * @param basePath array
 * @param routePath array
 **/
function areComparable(basePath, routePath) {
  const numActualRouteNames = countEndPlaceholders([...basePath])

  if (numActualRouteNames === basePath.length) {
    return routePath.length === numActualRouteNames
  } else {
    return routePath.length >= numActualRouteNames
  }
}

/**
 * Returns true if routes are identical
 * @param basePath array
 * @param routePath array
 **/
const compareRoutes = (basePath, routePath) => {
  console.log('comparable ', areComparable(basePath, routePath), basePath, routePath)
  if (areComparable(basePath, routePath)) {
    return basePath.every(function(element, index) {
      if (isPlaceholder(element)) {
        return true
      } else {
        return element === routePath[index]
      }
    })
  } else {
    return false
  }
}

/**
 * Returns the number of elements an array not counting placeholders at the end
 * @param route array
 * Private method - Mutates route
 **/
function countEndPlaceholders(route) {
  if (isPlaceholder(route[route.length - 1])) {
    route.pop()
    countEndPlaceholders(route)
  } else {
    return route.length
  }

  return route.length
}

/**
 * Return the named params (placeholders) of a pathname
 * @param pathname
 **/
const getNamedParams = (pathName = '') => {
  if (pathName.trim().length === '') return []

  const names = pathName.split(':')
  names.shift()

  return names.map(name => (name.slice(-1) === '/' ? name.slice(0, -1) : name))
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
 * Returns true if element is a placeholder
 * @param name
 * Private method
 **/
function isPlaceholder(element) {
  return element[0] === ':'
}

/**
 * Returns the first part of a pathname until the first named param
 * @param name
 **/
const nameToPath = (name = '') => {
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
 * removes the first slash from a route if any.
 * @param route
 * Private method
 **/
function stripFirstSlash(route) {
  if (route === '/' || route.trim().length === 0) return ''

  if (route[0] === '/') {
    route = route.slice(1)
  }

  return route
}

/**
 * find and return route given a path name. Returns false otherwise
 * @param routes // Array of absolute routes
 * @param pathNames // Array with all path names
 **/
function routeExists(routes, pathNames) {
  const result = routes
    .sort(function(a, b) {
      const lengthA = UrlParser('http://fake.com' + a.fullPath).pathNames.length
      const lengthB = UrlParser('http://fake.com' + b.fullPath).pathNames.lentgh
      return lengthB - lengthA
    })
    .find(route => {
      const urlParser = UrlParser('http://fake.com' + route.fullPath)
      console.log('compare ', urlParser.pathNames, pathNames, compareRoutes(urlParser.pathNames, pathNames))
      return compareRoutes(urlParser.pathNames, pathNames)
    })

  return result ? result : false
}

module.exports = {
  addAbsoluteRoutes,
  anyEmptyNestedRoutes,
  compareRoutes,
  getNamedParams,
  getPathNames,
  nameToPath,
  routeExists
}
