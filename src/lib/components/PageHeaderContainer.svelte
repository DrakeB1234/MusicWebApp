<script lang="ts">
  // Will attempt at first to redirect using browser history state, otherwise will use fallback href

  import { afterNavigate, goto } from "$app/navigation";
  import Icon from "./Icons/Icon.svelte";
  import Button from "./UI/Button.svelte";

  let { headerText, useHistory = true, fallbackHref = "/" } = $props();

  let hasPreviousPage = $state(false);

  // If from is !null, user navigated from inside app
  afterNavigate(({ from }) => {
    if (from) {
      hasPreviousPage = true;
    }
  });

  function handleBack() {
    if (hasPreviousPage && useHistory) {
      history.back();
    } else {
      goto(fallbackHref);
    }
  }
</script>

<div class="header-container flex-row lay-gap-xsm">
  <Button
    variant="text"
    size="icon-small"
    onclick={handleBack}
    aria-label="Go back to previous page"
  >
    <Icon icon="arrowLeftAlt" />
  </Button>

  <p class="text-body">{headerText}</p>
</div>
