const writable = require('svelte/store').writable

const router = writable({})

const set = route => {
  router.set(route)
}

const remove = () => {
  router.set({})
}

const activeRoute = {
  subscribe: router.subscribe,
  set,
  remove
}

module.exports = { activeRoute }
