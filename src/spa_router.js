const { activeRoute } = require('./store')
const { RouterCurrent } = require('./router/current')
const { RouterFinder } = require('./router/finder')
const { removeSlash } = require('./lib/utils')

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
  routerOptions = { ...options }
  if (typeof currentUrl === 'undefined' || currentUrl === '') {
    currentUrl = document.location.href
  }

  routerCurrent = RouterCurrent(routerOptions.gaPageviews)

  currentUrl = removeSlash(currentUrl, 'trail')
  userDefinedRoutes = routes

  function findActiveRoute() {
    let convert = false

    if (routerOptions.langConvertTo) {
      routerOptions.lang = routerOptions.langConvertTo
      convert = true
    }

    return RouterFinder({ routes, currentUrl, routerOptions, convert }).findActiveRoute()
  }

  /**
   * Redirect current route to another
   * @param destinationUrl
   **/
  function navigateNow(destinationUrl) {
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
      return navigateNow(currentRoute.redirectTo)
    }

    routerCurrent.setActive(currentRoute)
    activeRoute.set(currentRoute)

    return currentRoute
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
 * @param pathName String
 * @param language String
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
 * @param pathName String The path name to check against the current route.
 * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
 **/
function routeIsActive(queryPath, includePath = false) {
  return routerCurrent.isActive(queryPath, includePath)
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
