const { UrlParser } = require('url-params-parser')
const { activeRoute } = require('./store')
const {
  anyEmptyNestedRoutes,
  updateRoutePath,
  getNamedParams,
  nameToPath,
  pathWithQueryParams,
  removeSlash,
  routeNameLocalised
} = require('./lib/utils')

const NotFoundPage = '/404.html'
let userDefinedRoutes = []
let routerOptions = {}
let currentActiveRoute = ''

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

    if (!searchActiveRoute || anyEmptyNestedRoutes(searchActiveRoute)) {
      if (typeof window !== 'undefined') {
        forceRedirect(NotFoundPage)
      } else {
        searchActiveRoute = { name: '404', component: '', path: '404' }
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
    currentActiveRoute = destinationUrl

    if (typeof window !== 'undefined') {
      if (destinationUrl === NotFoundPage) {
        window.location = destinationUrl
      } else {
        navigateTo(destinationUrl)
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

  function setActiveRoute() {
    const currentRoute = findActiveRoute()

    if (currentRoute.redirectTo) {
      return forceRedirect(redirectTo)
    }

    currentActiveRoute = currentRoute.path
    activeRoute.set(currentRoute)

    pushActiveRoute(currentRoute)

    return currentRoute
  }

  /**
   * Updates the browser pathname and history with the active route.
   * @param currentRoute
   **/
  function pushActiveRoute(currentRoute) {
    if (typeof window !== 'undefined') {
      const pathAndSearch = pathWithQueryParams(currentRoute)
      window.history.pushState({ page: pathAndSearch }, '', pathAndSearch)
      if (routerOptions.gaPageviews) {
        gaTracking(pathAndSearch)
      }
    }
  }

  /**
   * Gets an array of routes and the browser pathname and return the active route
   * @param routes
   * @param basePath
   * @param pathNames
   **/

  function searchActiveRoutes(routes, basePath, pathNames, currentLanguage, convert) {
    let currentRoute = {}
    let routeLanguage = currentLanguage
    let basePathName = pathNames.shift().toLowerCase()

    routes.forEach(function(route) {
      const updatedPath = updateRoutePath(basePathName, pathNames, route, routeLanguage, convert)

      basePathName = updatedPath.result
      if (convert) {
        routeLanguage = currentLanguage
      } else {
        routeLanguage = updatedPath.language
      }

      const localisedPathName = routeNameLocalised(route, routeLanguage)
      const localisedRouteWithoutNamedParams = nameToPath(localisedPathName)
      const basePathNameWithoutNamedParams = nameToPath(basePathName)

      if (basePathNameWithoutNamedParams === localisedRouteWithoutNamedParams) {
        let namedPath = `${basePath}/${localisedPathName}`
        let routePath = `${basePath}/${basePathNameWithoutNamedParams}`
        if (routePath === '//') {
          routePath = '/'
        }

        if (routeLanguage) {
          pathNames = removeExtraPaths(pathNames, localisedRouteWithoutNamedParams)
        }

        redirectTo = setRedirectPath(route, redirectTo)

        const namedParams = getNamedParams(localisedPathName)
        if (namedParams && namedParams.length > 0) {
          namedParams.forEach(function() {
            if (pathNames.length > 0) {
              routePath += `/${pathNames.shift()}`
            }
          })
        }

        if (currentRoute.name !== routePath) {
          currentRoute = setCurrentRoute({ route, routePath, routeLanguage, urlParser, namedPath })
        }

        if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
          currentRoute.childRoute = searchActiveRoutes(route.nestedRoutes, routePath, pathNames, routeLanguage, convert)
          currentRoute.path = currentRoute.childRoute.path
          currentRoute.language = currentRoute.childRoute.language
        } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0) {
          const indexRoute = searchActiveRoutes(route.nestedRoutes, routePath, ['index'], routeLanguage, convert)
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
    const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams
    routeNamedParams = { ...routeNamedParams, ...parsedParams }
    return {
      name: routePath,
      component: route.component,
      layout: route.layout,
      queryParams: urlParser.queryParams,
      namedParams: routeNamedParams,
      path: routePath,
      language: routeLanguage
    }
  }

  function setRedirectPath(route, currentValue) {
    let redirectTo = currentValue
    if (route.redirectTo && route.redirectTo.length > 0) {
      redirectTo = route.redirectTo
    }

    if (route.onlyIf && route.onlyIf.guard) {
      if (!route.onlyIf.guard()) {
        let destinationUrl = '/'
        if (route.onlyIf.redirect && route.onlyIf.redirect.length > 0) {
          destinationUrl = route.onlyIf.redirect
        }
        redirectTo = destinationUrl
      }
    }

    return redirectTo
  }

  function removeExtraPaths(pathNames, basePathNames) {
    const names = basePathNames.split('/')
    if (names.length > 1) {
      names.forEach(function(name, index) {
        if (name.length > 0 && index > 0) {
          pathNames.shift()
        }
      })
    }

    return pathNames
  }

  return Object.freeze({
    setActiveRoute,
    findActiveRoute
  })
}

/**
 * Updates the current active route and updates the browser pathname
 * @param pathName
 **/
function localisedRoute(pathName, language) {
  pathName = removeSlash(pathName, 'lead')
  routerOptions.langConvertTo = language

  const activeRoute = SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute()

  return activeRoute
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
  const activeRoute = SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute()

  return activeRoute
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
  let activeRoute = currentActiveRoute
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
