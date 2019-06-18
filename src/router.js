const UrlParser = require('url-params-parser').UrlParser
const activeRoute = require('./store').activeRoute
const getNamedParams = require('./lib/utils').getNamedParams
const nameToPath = require('./lib/utils').nameToPath
const anyEmptyNestedRoutes = require('./lib/utils').anyEmptyNestedRoutes

let userDefinedRoutes = []
let notFoundPage = ''
let currentActiveRoute = ''
let urlParser = {}

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
 * Gets an array of routes and the browser pathname and return the active route
 * @param routes
 * @param basePath
 * @param pathNames
 **/
const searchActiveRoutes = (routes, basePath, pathNames) => {
  let currentRoute = {}
  const currentPathName = pathNames.shift().toLowerCase()

  routes.forEach(route => {
    if (currentPathName === nameToPath(route.name)) {
      let namedPath = `${basePath}/${route.name}`
      let routePath = `${basePath}/${nameToPath(route.name)}`
      if (routePath === '//') {
        routePath = '/'
      }

      const namedParams = getNamedParams(route.name)
      if (namedParams && namedParams.length > 0) {
        namedParams.forEach(() => {
          if (pathNames.length > 0) {
            routePath += `/${pathNames.shift()}`
          }
        })
      }

      currentRoute = {
        name: routePath,
        component: route.component,
        layout: route.layout,
        queryParams: urlParser.queryParams,
        namedParams: UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams
      }

      if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
        currentRoute.childRoute = searchActiveRoutes(route.nestedRoutes, routePath, pathNames)
      } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0) {
        const indexRoute = searchActiveRoutes(route.nestedRoutes, routePath, ['index'])
        if (indexRoute && Object.keys(indexRoute).length > 0) {
          currentRoute.childRoute = indexRoute
        }
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
const SpaRouter = ({ routes, pathName, notFound }) => {
  if (typeof pathName === 'undefined') {
    pathName = document.location.href
  }

  if (pathName.trim().length > 1 && pathName.slice(-1) === '/') {
    pathName = pathName.slice(0, -1)
  }

  urlParser = UrlParser(pathName)

  if (typeof notFound === 'undefined') {
    notFound = ''
  }

  userDefinedRoutes = routes
  notFoundPage = notFound

  const findActiveRoute = () => {
    let currentRoute = searchActiveRoutes(routes, '', urlParser.pathNames)

    if (!currentRoute || anyEmptyNestedRoutes(currentRoute)) {
      currentRoute = { name: '404', component: notFound, path: '404' }
    } else {
      currentRoute.path = urlParser.pathname
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
const currentRoute = queryPath => {
  const pathName = UrlParser(`http://fake.com${queryPath}`).pathname

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
