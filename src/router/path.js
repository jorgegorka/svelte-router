import { updateRoutePath, getNamedParams, nameToPath, removeExtraPaths, routeNameLocalised } from '../lib/utils';

export function RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage }) {
  let updatedPathRoute
  let route
  let routePathLanguage = currentLanguage

  function updatedPath(currentRoute) {
    route = currentRoute
    updatedPathRoute = updateRoutePath(basePathName, pathNames, route, routePathLanguage, convert)
    routePathLanguage = convert ? currentLanguage : updatedPathRoute.language

    return updatedPathRoute
  }

  function localisedPathName() {
    return routeNameLocalised(route, routePathLanguage)
  }

  function localisedRouteWithoutNamedParams() {
    return nameToPath(localisedPathName())
  }

  function basePathNameWithoutNamedParams() {
    return nameToPath(updatedPathRoute.result)
  }

  function namedPath() {
    const localisedPath = localisedPathName()

    return basePath ? `${basePath}/${localisedPath}` : localisedPath
  }

  function routePath() {
    let routePathValue = `${basePath}/${basePathNameWithoutNamedParams()}`
    if (routePathValue === '//') {
      routePathValue = '/'
    }

    if (routePathLanguage) {
      pathNames = removeExtraPaths(pathNames, localisedRouteWithoutNamedParams())
    }

    const namedParams = getNamedParams(localisedPathName())
    if (namedParams && namedParams.length > 0) {
      namedParams.forEach(function() {
        if (pathNames.length > 0) {
          routePathValue += `/${pathNames.shift()}`
        }
      })
    }

    return routePathValue
  }

  function routeLanguage() {
    return routePathLanguage
  }

  function basePathSameAsLocalised() {
    return basePathNameWithoutNamedParams() === localisedRouteWithoutNamedParams()
  }

  return Object.freeze({
    basePathSameAsLocalised,
    updatedPath,
    basePathNameWithoutNamedParams,
    localisedPathName,
    localisedRouteWithoutNamedParams,
    namedPath,
    pathNames,
    routeLanguage,
    routePath
  })
}
