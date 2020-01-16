const SpaRouter = require('./router').SpaRouter
const navigateTo = require('./router').navigateTo
const localisedRoute = require('./router').localisedRoute
const routeIsActive = require('./router').routeIsActive
const Route = require('./components/route.svelte')
const Router = require('./components/router.svelte')
const Navigate = require('./components/navigate.svelte')

module.exports = {
  SpaRouter,
  localisedRoute,
  navigateTo,
  routeIsActive,
  Route,
  Router,
  Navigate
}
