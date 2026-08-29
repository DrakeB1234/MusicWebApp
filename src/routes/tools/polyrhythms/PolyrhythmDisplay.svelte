<script lang="ts">
  import type { PolyrhythmPlayer } from "./polyrhythmPlayer.svelte";

  let {
    player,
  }: {
    player: PolyrhythmPlayer;
  } = $props();

  let playheadEl: HTMLDivElement;
  let rafId: number | undefined;

  function paintPlayhead() {
    if (playheadEl) {
      playheadEl.style.left = `${player.getBarProgress() * 100}%`;
    }
    rafId = requestAnimationFrame(paintPlayhead);
  }

  $effect(() => {
    if (player.isPlaying) {
      rafId = requestAnimationFrame(paintPlayhead);
    } else {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      if (playheadEl) playheadEl.style.left = "0%";
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  });
</script>

<div class="track-container flex-col">
  {#each player.tracks as track (track.id)}
    <div class="track-lane">
      {#each Array.from({ length: track.subdivisions }) as _, i}
        <span
          class="track-tick"
          data-color={track.color}
          style="left: {(i / track.subdivisions) * 100}%"
        ></span>
      {/each}
    </div>
  {/each}

  <div class="playhead" bind:this={playheadEl}></div>
</div>

<style>
  .track-container {
    position: relative;
  }

  .track-lane {
    position: relative;
    flex: 1;
    min-height: 3.5rem;
    border-left: 1px solid var(--color-border-subtle);
  }

  .track-lane + .track-lane {
    border-top: 1px solid var(--color-border-subtle);
  }

  .track-tick {
    position: absolute;
    top: var(--space-16);
    bottom: var(--space-16);
    width: 8px;
    border-radius: var(--radius-full);
    background-color: var(--track-color);
  }

  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: var(--color-on-bg-surface);
    pointer-events: none;
  }
</style>
