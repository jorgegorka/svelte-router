import { writable } from 'svelte/store';

const router = writable({});

const set = (route) => {
  router.set(route);
};

const remove = () => {
  router.set({});
};

const activeRoute = {
  subscribe: router.subscribe,
  set,
  remove,
};

export { activeRoute };
