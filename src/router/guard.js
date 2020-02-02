function RouterGuard(onlyIf) {
  const guardInfo = onlyIf

  function valid() {
    return guardInfo && guardInfo.guard && typeof guardInfo.guard === 'function'
  }

  function redirect() {
    return !guardInfo.guard()
  }

  function redirectPath() {
    let destinationUrl = '/'
    if (guardInfo.redirect && guardInfo.redirect.length > 0) {
      destinationUrl = guardInfo.redirect
    }

    return destinationUrl
  }

  return Object.freeze({ valid, redirect, redirectPath })
}

module.exports = { RouterGuard }
