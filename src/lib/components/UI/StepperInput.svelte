<script lang="ts">
  import Icon from "../Icons/Icon.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";

  type Props = {
    id: string;
    value: any;
    onStepperClick: (direction: number) => void;
  };

  let { id, value, onStepperClick }: Props = $props();
</script>

<div class="flex-row">
  <div class="decrement-button-wrapper">
    <Button
      variant="outlined"
      size="icon-small"
      onclick={() => onStepperClick(-1)}
      aria-label="Decrease value"
    >
      <Icon icon="minus" />
    </Button>
  </div>

  <div class="input-wrapper" aria-live="polite">
    <Input
      {id}
      {value}
      placeholder="0"
      style="text-align: center; border-color: transparent;"
      tabindex={-1}
      readonly
    />
  </div>

  <div class="increment-button-wrapper">
    <Button
      variant="outlined"
      size="icon-small"
      onclick={() => onStepperClick(1)}
      aria-label="Increase value"
    >
      <Icon icon="plus" />
    </Button>
  </div>
</div>

<style>
  .input-wrapper {
    pointer-events: none;
    max-width: 5ch;
  }
</style>
