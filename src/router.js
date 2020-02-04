const { UrlParser } = require('url-params-parser')
const { activeRoute } = require('./store')
const { RouterRedirect } = require('./router/redirect')
const { RouterCurrent } = require('./router/current')
const { RouterRoute } = require('./router/route')
const { RouterPath } = require('./router/path')
const {
  anyEmptyNestedRoutes,
  updateRoutePath,
  getNamedParams,
  nameToPath,
  pathWithQueryParams,
  removeExtraPaths,
  removeSlash,
  routeNameLocalised
} = require('./lib/utils')

const NotFoundPage = '/404.html'

let userDefinedRoutes = []
let routerOptions = {}
let routerCurrent

/**
 * Object exposes one single property: activeRoute
 * @param routes  Array of routes
 * @param currentUrl current url
 * @param options configuration options
 **/
function SpaRouter(routes, currentUrl, options = {}) {
  let redirectTo = ''
  routerOptions = { ...options }
  if (typeof currentUrl === 'undefined' || currentUrl === '') {
    currentUrl = document.location.href
  }

  routerCurrent = RouterCurrent(routerOptions.gaPageviews)

  currentUrl = removeSlash(currentUrl, 'trail')
  userDefinedRoutes = routes

  const urlParser = UrlParser(currentUrl)
  let routeNamedParams = {}

  function findActiveRoute() {
    let convert = false
    redirectTo = ''

    if (routerOptions.langConvertTo) {
      routerOptions.lang = routerOptions.langConvertTo
      convert = true
    }

    let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames, routerOptions.lang, convert)

    if (!searchActiveRoute || !Object.keys(searchActiveRoute).length || anyEmptyNestedRoutes(searchActiveRoute)) {
      if (typeof window !== 'undefined') {
        searchActiveRoute = { name: '404', component: '', path: '404', redirectTo: NotFoundPage }
      }
    } else {
      searchActiveRoute.path = pathWithQueryParams(searchActiveRoute)
    }

    return searchActiveRoute
  }

  /**
   * Redirect current route to another
   * @param destinationUrl
   **/
  function forceRedirect(destinationUrl) {
    if (typeof window !== 'undefined') {
      if (destinationUrl === NotFoundPage) {
        routerCurrent.setActive({ path: NotFoundPage })
      } else {
        navigateTo(destinationUrl)
      }
    }

    return destinationUrl
  }

  function setActiveRoute() {
    const currentRoute = findActiveRoute()
    if (currentRoute.redirectTo) {
      return forceRedirect(currentRoute.redirectTo)
    }

    routerCurrent.setActive(currentRoute)
    activeRoute.set(currentRoute)

    return currentRoute
  }

  /**
   * Gets an array of routes and the browser pathname and return the active route
   * @param routes
   * @param basePath
   * @param pathNames
   **/

  function searchActiveRoutes(routes, basePath, pathNames, currentLanguage, convert) {
    let currentRoute = {}
    let basePathName = pathNames.shift().toLowerCase()
    const routerPath = RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage })

    routes.forEach(function(route) {
      routerPath.updatedPath(route)
      if (routerPath.basePathSameAsLocalised()) {
        let routePath = routerPath.routePath()

        redirectTo = RouterRedirect(route, redirectTo).path()

        if (currentRoute.name !== routePath) {
          currentRoute = setCurrentRoute({
            route,
            routePath,
            routeLanguage: routerPath.routeLanguage(),
            urlParser,
            namedPath: routerPath.namedPath()
          })
        }

        if (route.nestedRoutes && route.nestedRoutes.length > 0 && routerPath.pathNames.length > 0) {
          currentRoute.childRoute = searchActiveRoutes(
            route.nestedRoutes,
            routePath,
            routerPath.pathNames,
            routerPath.routeLanguage(),
            convert
          )
          currentRoute.path = currentRoute.childRoute.path
          currentRoute.language = currentRoute.childRoute.language
        } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && routerPath.pathNames.length === 0) {
          const indexRoute = searchActiveRoutes(
            route.nestedRoutes,
            routePath,
            ['index'],
            routerPath.routeLanguage(),
            convert
          )
          if (indexRoute && Object.keys(indexRoute).length > 0) {
            currentRoute.childRoute = indexRoute
            currentRoute.language = currentRoute.childRoute.language
          }
        }
      }
    })

    if (redirectTo) {
      currentRoute.redirectTo = redirectTo
    }

    return currentRoute
  }

  function setCurrentRoute({ route, routePath, routeLanguage, urlParser, namedPath }) {
    const routerRoute = RouterRoute({
      routeInfo: route,
      urlParser,
      path: routePath,
      routeNamedParams,
      namedPath,
      language: routeLanguage
    })
    routeNamedParams = routerRoute.namedParams()
    return routerRoute.get()
  }

  return Object.freeze({
    setActiveRoute,
    findActiveRoute
  })
}

/**
 * Converts a route to its localised version
 * @param pathName
 **/
function localisedRoute(pathName, language) {
  pathName = removeSlash(pathName, 'lead')
  routerOptions.langConvertTo = language

  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute()
}

/**
 * Updates the current active route and updates the browser pathname
 * @param pathName
 **/
function navigateTo(pathName, language = null) {
  pathName = removeSlash(pathName, 'lead')

  if (language) {
    routerOptions.langConvertTo = language
  }
  return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute()
}

/**
 * Returns true if pathName is current active route
 * @param pathName
 **/
function routeIsActive(queryPath, includePath = false) {
  if (queryPath[0] !== '/') {
    queryPath = '/' + queryPath
  }

  // remove query params for comparison
  let pathName = UrlParser(`http://fake.com${queryPath}`).pathname
  let activeRoute = routerCurrent.active()
  let activeRoutePath = UrlParser(`http://fake.com${activeRoute}`).pathname

  pathName = removeSlash(pathName, 'trail')

  activeRoutePath = removeSlash(activeRoutePath, 'trail')

  if (includePath) {
    return activeRoutePath.includes(pathName)
  } else {
    return activeRoutePath === pathName
  }
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

module.exports = { SpaRouter, localisedRoute, navigateTo, routeIsActive }
