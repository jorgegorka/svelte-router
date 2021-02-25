<script>
  export let currentRoute = {};
  export let params = {};
</script>

{#if currentRoute.layout}
  <svelte:component this={currentRoute.layout} currentRoute={{ ...currentRoute, layout: '' }} {params} />
{:else if currentRoute.component}
  <svelte:component this={currentRoute.component} currentRoute={{ ...currentRoute, component: '' }} {params} />
{:else if currentRoute.childRoute}
  <svelte:self currentRoute={currentRoute.childRoute} {params} />
{/if}
