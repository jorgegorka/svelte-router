<script>
  import { onMount } from 'svelte';

  import { SpaRouter } from '../spa_router.js';
  import Route from './route.svelte';
  import { activeRoute } from '../store.js';

  export let routes = [];
  export let options = {};

  onMount(() => {
    SpaRouter(routes, document.location.href, options).setActiveRoute();
  });
</script>

<Route currentRoute={$activeRoute} />
