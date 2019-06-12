<script>
  import { onDestroy } from "svelte";
  import Route from "./route.svelte";
  import { activeRoute } from "../store";

  let currentRoute = {};
  const unsubscribe = activeRoute.subscribe(route => {
    currentRoute = route;
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<Route {currentRoute} />
