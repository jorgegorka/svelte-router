<script>
  import { navigateTo, currentRoute } from '../router'
  export let to = '/'
  export let title = ''
  export let styles = ''

  const navigate = event => {
    event.preventDefault()
    navigateTo(to)
  }
</script>

<a href={to} {title} on:click={navigate} class={styles} class:is-active={currentRoute(to)}>
  <slot />
</a>
