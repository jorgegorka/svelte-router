const writable = require('svelte/store').writable

const router = writable({})

function set(route) {
  router.set(route)
}

function remove() {
  router.set({})
}

const activeRoute = {
  subscribe: router.subscribe,
  set,
  remove
}

module.exports = { activeRoute }
