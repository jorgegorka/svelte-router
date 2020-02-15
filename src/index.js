const { SpaRouter, navigateTo, localisedRoute, routeIsActive } = require('./spa_router')
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
