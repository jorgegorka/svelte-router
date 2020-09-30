<script>
  export let currentRoute = {}
  export let params = {}
  
  let route = {};
  
  /*
  * This should make possible lazy loading for routes.
  * (ex: { layout: () => import('/path/to/my_layout.svelte', component: () => import('/path/to/my_component.svelte') )
  * See rollup documentation to enable code splitting
  */
  $: async function (currentRoute) {
    let { layout, component } = currentRoute;  
    try { 
      layout = layout(); // should return a promise
    } catch {/* empty */}
    
    try {
      component = component(); // should return a promise
    } catch { /* empty */ }
     
    
    [layout, component] = await Promise.all([layout, component])
        .then(results => {
          const [layout, component] = results;
          return [
            layout && layout.default ? layout.default : layout,
            component && component.default ? component.default : component
          ];
        });
    route = {...currentRoute, layout, component};
    
  }(currentRoute);
</script>

{#if route.layout}
  <svelte:component this={route.layout} currentRoute={{ ...route, layout: '' }} {params} />
{:else if route.component}
  <svelte:component this={route.component} currentRoute={{ ...route, component: '' }} {params} />
{:else if route.childRoute}
  <svelte:self currentRoute={route.childRoute} {params} />
{/if}
