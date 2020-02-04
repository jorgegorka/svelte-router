const { pathWithQueryParams } = require('../lib/utils')

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
   * Updates the browser pathname and history with the active route.
   * @param currentRoute
   **/
  function pushActiveRoute(newRoute) {
    if (typeof window !== 'undefined') {
      const pathAndSearch = pathWithQueryParams(newRoute)
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

  return Object.freeze({ active, setActive })
}

module.exports = { RouterCurrent }
