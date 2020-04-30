const { UrlParser } = require('url-params-parser')

const { pathWithQueryParams, removeSlash } = require('../lib/utils')

function RouterCurrent(trackPage) {
  const trackPageview = trackPage || false
  let activeRoute = ''

  function setActive(newRoute) {
    activeRoute = newRoute.path
    pushActiveRoute(newRoute)
  }

  function active() {
    return activeRoute
  }

  /**
   * Returns true if pathName is current active route
   * @param pathName String The path name to check against the current route.
   * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
   **/
  function isActive(queryPath, includePath = false) {
    if (queryPath[0] !== '/') {
      queryPath = '/' + queryPath
    }

    // remove query params for comparison
    let pathName = UrlParser(`http://fake.com${queryPath}`).pathname
    let activeRoutePath = UrlParser(`http://fake.com${activeRoute}`).pathname

    pathName = removeSlash(pathName, 'trail')

    activeRoutePath = removeSlash(activeRoutePath, 'trail')

    if (includePath) {
      return activeRoutePath.includes(pathName)
    } else {
      return activeRoutePath === pathName
    }
  }

  function pushActiveRoute(newRoute) {
    if (typeof window !== 'undefined') {
      const pathAndSearch = pathWithQueryParams(newRoute)
      //if (window.history && window.history.state && window.history.state.page !== pathAndSearch) {
      window.history.pushState({ page: pathAndSearch }, '', pathAndSearch)
      if (trackPageview) {
        gaTracking(pathAndSearch)
      }
    }
  }

  function gaTracking(newPage) {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', newPage)
      ga('send', 'pageview')
    }
  }

  return Object.freeze({ active, isActive, setActive })
}

module.exports = { RouterCurrent }
