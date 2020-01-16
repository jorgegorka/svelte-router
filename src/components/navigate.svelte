<script>
  import { navigateTo, routeIsActive } from '../router'
  export let to = '/'
  export let title = ''
  export let styles = ''
  export let lang = null

  function navigate(event) {
    event.preventDefault()
    event.stopPropagation()
    navigateTo(to, lang)
  }
</script>

<a href={to} {title} on:click={navigate} class={styles} class:active={routeIsActive(to)}>
  <slot />
</a>
