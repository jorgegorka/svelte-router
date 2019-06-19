const SpaRouter = require('./router').SpaRouter
const navigateTo = require('./router').navigateTo
const routeIsActive = require('./router').routeIsActive
const Route = require('./components/route.svelte')
const Router = require('./components/router.svelte')
const Navigate = require('./components/navigate.svelte')

module.exports = {
  SpaRouter,
  navigateTo,
  routeIsActive,
  Route,
  Router,
  Navigate
}
