/**
 * Returns the query params of a url into an object
 * @param queryParams
 **/
const parseQueryString = (queryParams = '') => {
  let searchParams = []

  if (typeof document !== 'undefined') {
    searchParams = new URLSearchParams(document.location.search)
  } else {
    if (queryParams.indexOf('?') !== -1) {
      queryParams = queryParams.substring(queryParams.indexOf('?'), queryParams.length)
    } else {
      return {}
    }
  }

  searchParams = new URLSearchParams(queryParams)

  const result = {}

  searchParams.forEach((value, key) => {
    result[key] = value
  })

  return result
}

/**
 * Splits a param into path and query params
 * @param queryParams
 **/
const extractQueryParams = pathName => {
  let pathRoute = ''
  let queryParams = {}

  if (pathName.indexOf('?') !== -1) {
    pathRoute = pathName.substring(pathName.indexOf('?'), -1)
    const querySearch = pathName.substring(pathName.indexOf('?'), pathName.length)
    queryParams = parseQueryString(querySearch)
  } else {
    pathRoute = pathName
  }

  if (pathRoute.trim().length > 1 && pathRoute.slice(-1) === '/') {
    pathRoute = pathRoute.slice(0, -1)
  }

  return [pathRoute, queryParams]
}

/**
 * Split a pathname based on /
 * @param pathName
 **/
const getPathNames = pathName => {
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
 * Return the first part of a pathname
 * @param name
 **/
const nameToPath = (name = '') => {
  const routeName = getPathNames(name)[0]

  return routeName.toLowerCase()
}

/**
 * Returns true if object has any nested routes empty
 * @param routeObject
 **/
const anyEmptyNestedRoutes = routeObject => {
  let result = false
  if (routeObject.nestedRoutes && routeObject.nestedRoutes.length === 0) {
    result = true
  } else if (routeObject.nestedRoutes) {
    result = anyEmptyNestedRoutes(routeObject.nestedRoutes[0])
  }

  return result
}

module.exports = {
  parseQueryString,
  getPathNames,
  getNamedParams,
  nameToPath,
  anyEmptyNestedRoutes,
  extractQueryParams
}
