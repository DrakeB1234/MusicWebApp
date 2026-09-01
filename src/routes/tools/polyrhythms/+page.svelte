<script lang="ts">
  import {
    SFX_PERCUSSION_OPTIONS,
    sfxAudioService,
  } from "$lib/audio/sfxAudioService.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Input from "$lib/components/UI/Input.svelte";
  import {
    PolyrhythmPlayer,
    trackColors,
    type PolyrhythmTrack,
  } from "./polyrhythmPlayer.svelte";
  import { onMount } from "svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import PolyrhythmDisplay from "./PolyrhythmDisplay.svelte";

  const player = new PolyrhythmPlayer();

  function handlePlayPressed() {
    player.togglePlay();
  }

  function handleAddTrackPressed() {
    player.createDefaultTrack();
  }

  function handleDeleteTrackPressed(idx: number) {
    player.removeTrack(idx);
  }

  function handleMuteTrackPressed(idx: number) {
    const newMutedState = !player.tracks[idx].muted;
    handleTrackUpdated(idx, { muted: newMutedState });
  }

  function handleBpmChanged(e: Event) {
    const input = e.target as HTMLInputElement;
    const bpm = parseInt(input.value);
    player.setBpm(bpm);
  }

  function handleInputChanged(
    idx: number,
    e: Event,
    key: keyof Omit<PolyrhythmTrack, "id">,
  ) {
    const input = e.currentTarget as HTMLInputElement | HTMLSelectElement;
    if (!input) return;

    const valueToUpdate =
      key === "subdivisions" || key === "volume"
        ? parseInt(input.value)
        : input.value;

    handleTrackUpdated(idx, { [key]: valueToUpdate });
  }

  function handleTrackUpdated(
    idx: number,
    updates: Partial<Omit<PolyrhythmTrack, "id">>,
  ) {
    player.updateTrack(idx, updates);
  }

  onMount(() => {
    player.init();

    return () => {
      Howler.stop();
      player.stop();
    };
  });
</script>

<svelte:head>
  <title>Polyrhythms | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Polyrhythms" fallbackHref="/tools" />

    <section class="display-card card space-above-base">
      <PolyrhythmDisplay {player} />
    </section>

    <section class="inputs-card card space-above-base">
      <div class="inputs-card__start flex-row lay-gap-lg">
        <Button size="icon-small" circle onclick={handlePlayPressed}>
          <Icon icon={player.isPlaying ? "stop" : "playArrow"} />
        </Button>

        <div class="flex-row">
          <Label labelFor="bpm">BPM</Label>
          <Input
            id="bpm"
            type="number"
            value={player.bpm}
            placeholder={PolyrhythmPlayer.DEFAULT_BPM.toString()}
            min="40"
            max="240"
            onchange={handleBpmChanged}
          />
        </div>
      </div>

      <hr />

      <div class="lay-grid">
        {#each player.tracks as track, idx (track.id)}
          <div class="track" data-color={track.color}>
            <div class="track__name">
              <p>Track {idx + 1}</p>
            </div>
            <div class="track__buttons flex-row space-above-base">
              <Button
                variant="text"
                size="icon-small"
                state={track.muted ? "off" : "on"}
                onclick={() => handleMuteTrackPressed(idx)}
              >
                <Icon icon="volumeUp" />
              </Button>
              <Button
                variant="text"
                size="icon-small"
                onclick={() => handleDeleteTrackPressed(idx)}
              >
                <Icon icon="delete" />
              </Button>
            </div>

            <div class="flex-row lay-gap-lg space-above-lg">
              <div class="flex-col__input-label">
                <Label labelFor="beats-track-{idx}">Subdivision</Label>
                <Input
                  id="beats-track-{idx}"
                  type="number"
                  value={track.subdivisions}
                  placeholder="4"
                  min="1"
                  max="16"
                  onchange={(e) => handleInputChanged(idx, e, "subdivisions")}
                />
              </div>
              <div class="flex-col__input-label">
                <Label labelFor="color-track-{idx}">Color</Label>
                <Select
                  id="color-track-{idx}"
                  value={track.color}
                  options={trackColors.map((c) => {
                    return {
                      value: c,
                      label: c.charAt(0).toUpperCase() + c.slice(1),
                    };
                  })}
                  onchange={(e) => handleInputChanged(idx, e, "color")}
                />
              </div>
              <div class="flex-col__input-label">
                <Label labelFor="sound-track-{idx}">Sound</Label>
                <Select
                  id="sound-track-{idx}"
                  value={track.sound}
                  options={SFX_PERCUSSION_OPTIONS}
                  onchange={(e) => handleInputChanged(idx, e, "sound")}
                />
              </div>
            </div>
          </div>
        {/each}
        <div class="add-track">
          <Button
            variant="text"
            class="add-track-button"
            fullWidth
            onclick={handleAddTrackPressed}
          >
            <Icon icon="plus" />
          </Button>
        </div>
      </div>
    </section>
  </main>
</Wrapper>

<style>
  main {
    display: flex;
    flex-direction: column;

    width: 100%;
    padding: var(--app-padding);
  }

  .display-card {
    background-color: var(--color-bg-page);
    padding: var(--space-12) var(--space-24);
  }

  .inputs-card {
    padding: 0;
    overflow: hidden;
  }

  .inputs-card__start {
    padding: var(--space-24) var(--space-16);
  }

  .track {
    padding: var(--space-16) var(--space-12);
    border-bottom: 1px solid var(--color-border-subtle);
    border-left: 6px solid var(--track-color);
  }

  .track__top-container > p {
    margin-right: var(--space-16);
    overflow-x: auto;
  }

  :global {
    :root {
      [data-color="red"] {
        --track-color: var(--color-bg-track-red);
      }

      [data-color="yellow"] {
        --track-color: var(--color-bg-track-yellow);
      }

      [data-color="blue"] {
        --track-color: var(--color-bg-track-blue);
      }

      [data-color="green"] {
        --track-color: var(--color-bg-track-green);
      }

      [data-color="orange"] {
        --track-color: var(--color-bg-track-orange);
      }

      [data-color="purple"] {
        --track-color: var(--color-bg-track-purple);
      }
    }

    .btn.add-track-button {
      padding: var(--space-16);
      border-radius: 0;
    }
  }
</style>
