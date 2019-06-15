const SpaRouter = require('./router').SpaRouter
const navigateTo = require('./router').navigateTo
const currentRoute = require('./router').currentRoute
const Route = require('./components/route.svelte')
const MainLayout = require('./components/main_layout.svelte')
const Navigate = require('./components/navigate.svelte')

module.exports = {
  SpaRouter,
  navigateTo,
  currentRoute,
  Route,
  MainLayout,
  Navigate
}
