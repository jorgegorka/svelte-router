const Router = require("./src/router").Router;
const navigateTo = require("./src/router").navigateTo;
const Route = require("./src/components/route.svelte");
const Navigate = require("./src/components/navigate.svelte");

module.exports = {
  Router,
  navigateTo,
  Route,
  Navigate
};
