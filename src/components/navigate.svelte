<script>
  import { navigateTo, routeIsActive } from '../router'
  export let to = '/'
  export let title = ''
  export let styles = ''

  const navigate = event => {
    event.preventDefault()
    event.stopPropagation()
    navigateTo(to)
  }
</script>

<a href={to} {title} on:click={navigate} class={styles} class:active={routeIsActive(to)}>
  <slot />
</a>
