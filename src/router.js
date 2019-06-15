const activeRoute = require('./store').activeRoute
const getPathNames = require('./lib/utils').getPathNames
const parseQueryString = require('./lib/utils').parseQueryString
const getNamedParams = require('./lib/utils').getNamedParams
const nameToPath = require('./lib/utils').nameToPath

let userDefinedRoutes = []
let notFoundPage = ''
let currentActiveRoute = ''

/**
 * Updates the browser pathname and history with the active route.
 * @param currentRoute
 **/
const pushActiveRoute = () => {
  if (typeof window !== 'undefined') {
    window.history.pushState({ page: currentActiveRoute }, '', currentActiveRoute)
  }
}

/**
 * Add named params to currentRoute as an object with the param name and the value.
 * @param pathNames
 * @param currentRoute
 * @param routeName
 **/
const addNamedParams = (pathNames, currentRoute, routeName) => {
  const paramNames = getNamedParams(routeName)
  if (paramNames.length > 0) {
    pathNames.forEach((pathName, index) => {
      const paramName = paramNames[index]
      if (paramName) {
        currentRoute.params[paramName] = pathName
      }
    })
  }
}

/**
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param basePath
 * @param pathNames
 **/
const searchActiveRoutes = (routes, basePath, pathNames) => {
  const currentRoutes = []
  const currentPathName = pathNames.shift().toLowerCase()

  routes.forEach(route => {
    if (currentPathName === nameToPath(route.name)) {
      let routePath = `${basePath}/${nameToPath(route.name)}`
      if (routePath === '//') {
        routePath = '/'
      }
      const currentRoute = {
        name: routePath,
        layout: route.layout,
        component: route.component,
        params: {}
      }

      if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
        currentRoute.nestedRoutes = searchActiveRoutes(route.nestedRoutes, routePath, pathNames)
      } else {
        if (pathNames.length > 0) {
          addNamedParams(pathNames, currentRoute, route.name)
        }
        currentRoute.queryParams = parseQueryString()
      }
      currentRoutes.push(currentRoute)
    }
  })

  return currentRoutes
}

/**
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param pathName
 * @param notFound
 **/
const SpaRouter = ({ routes, pathName, notFound }) => {
  if (typeof pathName === 'undefined') {
    pathName = document.location.pathname
  }

  if (pathName.trim().length === 0) {
    pathName = '/'
  }

  if (typeof notFound === 'undefined') {
    notFound = ''
  }

  userDefinedRoutes = routes
  notFoundPage = notFound

  const findActiveRoute = () => {
    let currentRoute
    const currentRoutes = searchActiveRoutes(routes, '', getPathNames(pathName))

    if (currentRoutes.length === 0) {
      currentRoute = { name: '404', component: notFound, path: '404' }
    } else {
      currentRoute = currentRoutes[0]
      currentRoute.path = pathName
    }

    return currentRoute
  }

  const generate = () => {
    const currentRoute = findActiveRoute()

    currentActiveRoute = currentRoute.path
    activeRoute.set(currentRoute)
    pushActiveRoute()

    return currentRoute
  }

  return Object.freeze({
    activeRoute: generate()
  })
}

/**
 * Updates the current active route and updates the browser pathname
 * @param pathName
 **/
const navigateTo = pathName => {
  const activeRoute = SpaRouter({ routes: userDefinedRoutes, pathName, notFound: notFoundPage }).activeRoute
  return activeRoute
}

/**
 * Returns true if pathName is current active route
 * @param pathName
 **/
const currentRoute = pathName => {
  return currentActiveRoute === pathName
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', event => {
    if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
      event.preventDefault()
      event.stopPropagation()
      navigateTo(event.target.pathname)
    }
  })
}

module.exports = { SpaRouter, navigateTo, currentRoute }
