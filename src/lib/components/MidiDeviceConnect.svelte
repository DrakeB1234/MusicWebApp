<script lang="ts">
  import { midiService } from "$lib/midiservice/midiService.svelte";
  import Icon from "./Icons/Icon.svelte";
  import Modal from "./Modal/Modal.svelte";
  import Button from "./UI/Button.svelte";
  import "$lib/components/Modal/modal.css";

  let isModalOpen = $state(false);

  function closeModal() {
    isModalOpen = false;
  }
</script>

<Button variant="outlined" size="small" onclick={() => (isModalOpen = true)}>
  <Icon icon="piano" size="var(--icon-size-sm)" />
  Device
  <span class={midiService.isDeviceConnected ? "connected" : "disconnected"}
  ></span>
</Button>

<Modal bind:isOpen={isModalOpen}>
  <div class="modal-card">
    <div class="modal-header">
      <h2 class="text-heading-3">Midi Device Connect</h2>
      <Button variant="text" size="icon-small" onclick={closeModal}>
        <Icon icon="close" />
      </Button>
    </div>

    <div class="modal-body">
      <p class="text-caption">Current Device Status:</p>
      <p class={midiService.isDeviceConnected ? "connected" : "disconnected"}>
        {midiService.isDeviceConnected ? "Connected" : "Disconnected"}
      </p>

      {#if midiService.connectedDeviceName}
        <p class="text-caption space-above-sm">Device Name:</p>
        <p>{midiService.connectedDeviceName}</p>
      {/if}
      {#if midiService.error}
        <p class="text-caption space-above-sm">Error:</p>
        <p class="disconnected">{midiService.error}</p>
      {/if}

      {#if !midiService.isDeviceConnected}
        <div class="refresh-button">
          <Button class="space-above-base" onclick={midiService.refreshDevices}>
            <Icon icon="refresh" size="var(--icon-size-sm)" />
            Refresh Devices
          </Button>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <Button variant="outlined" onclick={closeModal}>Close</Button>
    </div>
  </div>
</Modal>

<style>
  span {
    height: 6px;
    width: 6px;
    border-radius: var(--radius-full);
    margin-left: var(--space-4);
  }
  span.disconnected {
    background-color: var(--color-bg-danger);
  }
  span.connected {
    background-color: var(--color-bg-success);
  }
  p.disconnected {
    color: var(--color-bg-danger);
  }
  p.connected {
    color: var(--color-bg-success);
  }
  .refresh-button {
    display: flex;
    justify-content: end;
  }
</style>
