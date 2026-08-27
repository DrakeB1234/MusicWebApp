<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    isOpen = $bindable(false),
    children,
  }: {
    isOpen: boolean;
    children: Snippet;
  } = $props();

  let dialogElement: HTMLDialogElement;

  $effect(() => {
    if (isOpen) {
      dialogElement.showModal();
    } else if (dialogElement.open) {
      dialogElement.close();
    }
  });

  function handleClose() {
    isOpen = false;
  }
</script>

<dialog bind:this={dialogElement} onclose={handleClose} class="modal-wrapper">
  {@render children()}
</dialog>

<style>
  .modal-wrapper {
    position: fixed;
    inset: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;

    padding: var(--space-8);
    border: none;
    background-color: transparent;
  }

  .modal-wrapper::backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }

  @media (min-width: 600px) {
    .modal-wrapper {
      align-items: center;
      padding: var(--space-16);
    }
  }
</style>
