<script lang="ts">
  import Icon, { type IconType } from "../Icons/Icon.svelte";
  import Button from "../UI/Button.svelte";

  type Props = {
    icon: IconType;
    color: string;
    title: string;
    description: string;
    href: string;
  };

  let { icon, color, title, description, href }: Props = $props();
</script>

<Button element="a" variant="text" class="item-button" {href} fullWidth>
  <div class="flex-row lay-gap-base">
    <div class="icon-container {color}">
      <Icon {icon} />
    </div>
    <div class="item-button__text flex-col lay-gap-xsm">
      <p class="text-heading-3">{title}</p>
      <p class="text-caption-subtle">{description}</p>
    </div>
  </div>
</Button>

<style>
  :global(.btn.item-button) {
    justify-content: start;
    padding: var(--space-16);
    border-radius: 0;
  }
  .item-button__text {
    text-align: left;
  }
</style>
