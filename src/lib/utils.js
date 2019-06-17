/**
 * Split a pathname based on /
 * @param pathName
 * Private method
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

module.exports = {
  getPathNames,
  getNamedParams,
  nameToPath,
  anyEmptyNestedRoutes
}
