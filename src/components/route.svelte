<script>
  export let currentRoute = {}
</script>

{#if currentRoute.layout}
  <svelte:component this={currentRoute.layout} currentRoute={{ component: currentRoute.component }} />
{:else}
  <svelte:component this={currentRoute.component} />
{/if}
{#if currentRoute.nestedRoutes && currentRoute.nestedRoutes.length > 0}
  <svelte:self currentRoute={currentRoute.nestedRoutes[0]} />
{/if}
