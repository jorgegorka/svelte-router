import { writable } from 'svelte/store';

const { set, subscribe } = writable({});

const remove = () => {
  set({});
};

const activeRoute = {
  subscribe,
  set,
  remove,
};

export { activeRoute };
