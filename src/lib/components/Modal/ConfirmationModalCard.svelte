<script lang="ts">
  import "$lib/components/Modal/modal.css";
  import Icon from "../Icons/Icon.svelte";
  import Button from "../UI/Button.svelte";

  type Props = {
    title?: string;
    message?: string;
    confirmationText?: string;
    onResponse: (confirmation: boolean) => void;
  };

  let {
    title = "Confirmation",
    message = "Are you sure?",
    confirmationText = "Confirm",
    onResponse,
  }: Props = $props();

  function handleResponse(confirmation: boolean) {
    onResponse(confirmation);
  }
</script>

<div class="modal-card">
  <div class="modal-header">
    <h2 class="text-heading-3">{title}</h2>
    <Button
      variant="text"
      size="icon-small"
      onclick={() => handleResponse(false)}
    >
      <Icon icon="close" />
    </Button>
  </div>

  <div class="modal-body">
    <p class="text-max-width-base">{message}</p>
  </div>

  <div class="modal-footer">
    <Button variant="outlined" onclick={() => handleResponse(false)}
      >Cancel</Button
    >
    <Button onclick={() => handleResponse(true)}>{confirmationText}</Button>
  </div>
</div>

<style>
  .modal-footer {
    border: none;
  }
</style>
