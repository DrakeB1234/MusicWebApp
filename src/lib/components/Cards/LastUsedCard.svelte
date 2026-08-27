<script>
  import Icon from "../Icons/Icon.svelte";
  import Button from "../UI/Button.svelte";

  let {
    title = "Title",
    description = "Description of the card.",
    color = "",
    icon,
    href = "/",
  } = $props();
</script>

<Button element="a" variant="text" class="card-button" {href}>
  <div class="lay-col">
    <div
      class="icon-container"
      style="background-color: var(--color-bg-addon-{color});"
    >
      <Icon {icon} />
    </div>
    <div class="space-above-xsmall">
      <h3>{title}</h3>
      <p class="text-caption-muted space-above-small text-max-width-med">
        {description}
      </p>
    </div>
  </div>
</Button>

<style>
  .lay-col {
    min-width: 200px;
    justify-content: start;
  }

  .icon-container {
    margin-bottom: auto;
  }
</style>
