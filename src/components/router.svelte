<script>
  import Route from './route.svelte'
  import { activeRoute } from '../store'
</script>

<Route currentRoute={$activeRoute} />
