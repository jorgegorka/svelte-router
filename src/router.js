const { UrlParser } = require('url-params-parser')
const { activeRoute } = require('./store')
const { anyEmptyNestedRoutes, compareRoutes, getNamedParams, nameToPath, pathWithSearch } = require('./lib/utils')

let userDefinedRoutes = []
let notFoundPage = ''
let currentActiveRoute = ''
let urlParser = {}
let routeNamedParams = {}

/**
 * Redirect current route to another
 * @param destinationUrl
 **/
function forceRedirect(destinationUrl) {
  if (typeof window !== 'undefined') {
    if (destinationUrl.includes('http')) {
      window.location = destinationUrl
    } else {
      if (gaPageviews) {
        gaTracking(destinationUrl)
      }
      window.location.pathname = destinationUrl
    }
  }

  return destinationUrl
}

function gaTracking(newPage) {
  if (typeof ga !== 'undefined') {
    ga('set', 'page', newPage)
    ga('send', 'pageview')
  }
}
/**
 * Updates the browser pathname and history with the active route.
 * @param currentRoute
 **/
function pushActiveRoute(currentRoute, gaPageviews) {
  if (typeof window !== 'undefined') {
    const pathAndSearch = pathWithSearch(currentRoute)
    if (gaPageviews) {
      gaTracking(pathAndSearch)
    }
    window.history.pushState({ page: pathAndSearch }, '', pathAndSearch)
  }
}

/**
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param basePath
 * @param pathNames
 **/
function searchActiveRoutes(routes, basePath, pathNames) {
  let currentRoute = {}
  let basePathName = pathNames.shift().toLowerCase()

  routes.forEach(function(route) {
    basePathName = compareRoutes(basePathName, pathNames, route)

    if (basePathName === nameToPath(route.name)) {
      let namedPath = `${basePath}/${route.name}`
      let routePath = `${basePath}/${nameToPath(route.name)}`
      if (routePath === '//') {
        routePath = '/'
      }

      if (route.redirectTo && route.redirectTo.length > 0) {
        return forceRedirect(route.redirectTo)
      }

      if (route.onlyIf && route.onlyIf.guard) {
        if (!route.onlyIf.guard()) {
          let destinationUrl = '/'
          if (route.onlyIf.redirect && route.onlyIf.redirect.length > 0) {
            destinationUrl = route.onlyIf.failure
          }

          return forceRedirect(destinationUrl)
        }
      }

      const namedParams = getNamedParams(route.name)
      if (namedParams && namedParams.length > 0) {
        namedParams.forEach(function() {
          if (pathNames.length > 0) {
            routePath += `/${pathNames.shift()}`
          }
        })
      }

      if (currentRoute.name !== routePath) {
        const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams
        routeNamedParams = { ...routeNamedParams, ...parsedParams }
        currentRoute = {
          name: routePath,
          component: route.component,
          layout: route.layout,
          queryParams: urlParser.queryParams,
          namedParams: routeNamedParams
        }
      }

      if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
        currentRoute.childRoute = searchActiveRoutes(route.nestedRoutes, routePath, pathNames)
      } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0) {
        const indexRoute = searchActiveRoutes(route.nestedRoutes, routePath, ['index'])
        if (indexRoute && Object.keys(indexRoute).length > 0) {
          currentRoute.childRoute = indexRoute
        }
      } else if (route.nestedRoutes && route.nestedRoutes.length === 0 && pathNames.length > 0) {
      }
    }
  })

  return currentRoute
}

/**
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param pathName
 * @param notFound
 **/
function SpaRouter({ routes, pathName, gaPageviews = false }) {
  if (typeof pathName === 'undefined') {
    pathName = document.location.href
  }

  if (pathName.trim().length > 1 && pathName.slice(-1) === '/') {
    pathName = pathName.slice(0, -1)
  }

  urlParser = UrlParser(pathName)

  userDefinedRoutes = routes

  function findActiveRoute() {
    routeNamedParams = {}
    let currentRoute = searchActiveRoutes(routes, '', urlParser.pathNames)

    if (!currentRoute || anyEmptyNestedRoutes(currentRoute)) {
      if (typeof window !== 'undefined') {
        forceRedirect('/404.html')
      } else {
        currentRoute = { name: '404', component: '', path: '404' }
      }
    } else {
      currentRoute.path = urlParser.pathname
    }

    return currentRoute
  }

  function generate() {
    const currentRoute = findActiveRoute()

    currentActiveRoute = currentRoute.path
    activeRoute.set(currentRoute)
    pushActiveRoute(currentRoute, gaPageviews)

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
function navigateTo(pathName) {
  if (pathName.trim().length > 1 && pathName[0] === '/') {
    pathName = pathName.slice(1)
  }

  const activeRoute = SpaRouter({
    routes: userDefinedRoutes,
    pathName: 'http://fake.com/' + pathName,
    notFound: notFoundPage
  }).activeRoute

  return activeRoute
}

/**
 * Returns true if pathName is current active route
 * @param pathName
 **/
function routeIsActive(queryPath) {
  if (queryPath[0] !== '/') {
    queryPath = '/' + queryPath
  }
  let pathName = UrlParser(`http://fake.com${queryPath}`).pathname
  if (pathName.slice(-1) === '/') {
    pathName = pathName.slice(0, -1)
  }
  let activeRoute = currentActiveRoute
  if (activeRoute.slice(-1) === '/') {
    activeRoute = activeRoute.slice(0, -1)
  }

  return activeRoute === pathName
}

if (typeof window !== 'undefined') {
  // Avoid full page reload on local routes
  window.addEventListener('click', event => {
    if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
      event.preventDefault()
      // event.stopPropagation()
      navigateTo(event.target.pathname + event.target.search)
    }
  })

  window.onpopstate = function(_event) {
    navigateTo(window.location.pathname + window.location.search)
  }
}

module.exports = { SpaRouter, navigateTo, routeIsActive }
