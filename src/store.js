import {writable} from 'svelte/store';

const router = writable({})

function set(route) {
  router.set(route)
}

function remove() {
  router.set({})
}

export const activeRoute = {
  subscribe: router.subscribe,
  set,
  remove
}

