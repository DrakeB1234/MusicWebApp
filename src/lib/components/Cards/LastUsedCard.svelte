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
  <div class="flex-col">
    <div
      class="icon-container"
      style="background-color: var(--color-bg-addon-{color});"
    >
      <Icon {icon} />
    </div>
    <div class="space-above-xsm">
      <h3>{title}</h3>
      <p
        class="text-caption-subtle space-above-sm text-max-width-base text-line-clamp-3"
      >
        {description}
      </p>
    </div>
  </div>
</Button>

<style>
  .flex-col {
    min-width: 200px;
    justify-content: start;
  }

  .icon-container {
    margin-bottom: auto;
  }
</style>
