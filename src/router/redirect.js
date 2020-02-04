const { RouterGuard } = require('./guard')

function RouterRedirect(route, currentPath) {
  const guard = RouterGuard(route.onlyIf)

  function path() {
    let redirectTo = currentPath
    if (route.redirectTo && route.redirectTo.length > 0) {
      redirectTo = route.redirectTo
    }

    if (guard.valid() && guard.redirect()) {
      redirectTo = guard.redirectPath()
    }

    return redirectTo
  }

  return Object.freeze({ path })
}

module.exports = { RouterRedirect }
