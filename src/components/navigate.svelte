<script>
  import { onMount } from 'svelte';
  import { localisedRoute, navigateTo, routeIsActive } from '../spa_router';

  export let to = '/';
  export let title = '';
  export let styles = '';
  export let lang = null;

  onMount(() => {
    if (lang) {
      const route = localisedRoute(to, lang);
      if (route) {
        to = route.path;
      }
    }
  });

  const navigate = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();
    navigateTo(to);
  };
</script>

<a href={to} {title} on:click={navigate} class={styles} class:active={routeIsActive(to)}>
  <slot />
</a>
