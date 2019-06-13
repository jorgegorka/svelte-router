const activeRoute = require('./store').activeRoute
const getPathNames = require('./lib/utils').getPathNames
const parseQueryString = require('./lib/utils').parseQueryString
const getNamedParams = require('./lib/utils').getNamedParams
const nameToPath = require('./lib/utils').nameToPath

/**
 * Updates the browser pathname and history with the active route.
 * @param currentRoute
 **/
const pushActiveRoute = currentRoute => {
  if (typeof window !== 'undefined') {
    window.history.pushState({ page: currentRoute.path }, '', currentRoute.path)
  }
}

let userDefinedRoutes = []
let notFoundPage = ''

/**
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param basePath
 * @param pathNames
 **/
const findActiveRoutes = (routes, basePath, pathNames) => {
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
        currentRoute.nestedRoutes = findActiveRoutes(route.nestedRoutes, routePath, pathNames)
      } else {
        if (pathNames.length > 0) {
          const paramNames = getNamedParams(route.name)
          if (paramNames.length > 0) {
            pathNames.forEach((pathName, index) => {
              const paramName = paramNames[index]
              if (paramName) {
                currentRoute.params[paramName] = pathName
              }
            })
          }
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
  if (typeof pathName === 'undefined' || pathName.trim().length === 0) {
    pathName = document.location.pathname
  }

  if (typeof notFound === 'undefined') {
    notFound = ''
  }

  userDefinedRoutes = routes
  notFoundPage = notFound

  const getActiveRoute = () => {
    let currentRoute
    const currentRoutes = findActiveRoutes(routes, '', getPathNames(pathName))

    if (currentRoutes.length === 0) {
      currentRoute = { name: '404', component: notFound, path: '404' }
    } else {
      currentRoute = currentRoutes[0]
      currentRoute.path = pathName
    }

    activeRoute.set(currentRoute)
    pushActiveRoute(currentRoute)

    return currentRoute
  }

  return Object.freeze({
    activeRoute: getActiveRoute()
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

if (typeof window !== 'undefined') {
  window.addEventListener('click', event => {
    if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
      event.preventDefault()
      event.stopPropagation()
      navigateTo(event.target.pathname)
    }
  })
}

module.exports = { SpaRouter, navigateTo }
