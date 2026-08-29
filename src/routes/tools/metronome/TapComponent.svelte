<script lang="ts">
  import Button from "$lib/components/UI/Button.svelte";

  type Props = {
    onTap: () => void;
    inputBpmAmount: number;
  };

  let { onTap, inputBpmAmount = $bindable() }: Props = $props();

  let tapTimes: number[] = [];
  const MAX_TAPS = 8;
  const TAP_TIMEOUT = 2000;

  function handleTap() {
    onTap();

    const now = performance.now();

    if (
      tapTimes.length > 0 &&
      now - tapTimes[tapTimes.length - 1] > TAP_TIMEOUT
    ) {
      tapTimes = [];
    }

    tapTimes.push(now);

    if (tapTimes.length > MAX_TAPS) {
      tapTimes.shift();
    }

    if (tapTimes.length >= 2) {
      // Get total time elapsed
      const totalTimeElapsed = tapTimes[tapTimes.length - 1] - tapTimes[0];
      const averageInterval = totalTimeElapsed / (tapTimes.length - 1);

      let calculatedBpm = Math.round(60000 / averageInterval);

      if (calculatedBpm < 40) calculatedBpm = 40;
      if (calculatedBpm > 240) calculatedBpm = 240;

      // Update parent component's inputBpmAmount with the calculated BPM
      inputBpmAmount = calculatedBpm;
    }
  }
</script>

<div class="tap-button-container">
  <Button
    variant="secondary"
    size="large"
    onclick={handleTap}
    aria-label="Click repeatedly to estimate tapped bpm"
    title="Click repeatedly to estimate tapped bpm"
    fullWidth
  >
    <p>TAP</p>
  </Button>
</div>

<style>
  .tap-button-container {
    width: 100%;
    max-width: 120px;
  }
</style>
