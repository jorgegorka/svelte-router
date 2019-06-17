const SpaRouter = require('./router').SpaRouter
const navigateTo = require('./router').navigateTo
const currentRoute = require('./router').currentRoute
const Route = require('./components/route.svelte')
const Router = require('./components/router.svelte')
const Navigate = require('./components/navigate.svelte')

module.exports = {
  SpaRouter,
  navigateTo,
  currentRoute,
  Route,
  Router,
  Navigate
}
