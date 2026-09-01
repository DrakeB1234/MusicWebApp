<script lang="ts">
  import {
    SFX_PERCUSSION_OPTIONS,
    sfxAudioService,
    type PercussionSoundName,
  } from "$lib/audio/sfxAudioService.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { onDestroy, onMount } from "svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Slider from "$lib/components/UI/Slider.svelte";
  import TapComponent from "./TapComponent.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";
  import { page } from "$app/state";

  let inputBpmAmount = $state(120);
  let accentSound: PercussionSoundName = $state("woodblock_1");
  let standardSound: PercussionSoundName = $state("woodblock_2");

  const MIN_BPM = 40;
  const MAX_BPM = 240;

  let currentBeatCount: number = $state(0);
  let metrnomeInterval: ReturnType<typeof setInterval> | null = $state(null);
  let inputBeatCount: number = $state(4);
  let inputBeatValueCount: number = $state(4);

  function handleBpmButtonPress(amount: number) {
    if (metrnomeInterval) {
      stopMetronome();
    }

    const newBpm = inputBpmAmount + amount;
    if (newBpm < MIN_BPM || newBpm > MAX_BPM) {
      return;
    }

    inputBpmAmount += amount;

    handleInputChange();
  }

  function handlePlayPressed() {
    if (metrnomeInterval) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }

  function handleInputChange() {
    if (metrnomeInterval) {
      stopMetronome();
    }
  }

  function startMetronome() {
    if (metrnomeInterval) {
      stopMetronome();
    }

    const beatDurationMultiplier = 4 / inputBeatValueCount;
    const intervalTime = (60 / inputBpmAmount) * 1000 * beatDurationMultiplier;

    // Start with sound immediately
    currentBeatCount = 1;
    sfxAudioService.play(accentSound);

    metrnomeInterval = setInterval(() => {
      currentBeatCount++;

      if (currentBeatCount > inputBeatCount) currentBeatCount = 1;

      if (currentBeatCount === 1) {
        sfxAudioService.play(accentSound);
      } else {
        sfxAudioService.play(standardSound);
      }
    }, intervalTime);
  }

  function stopMetronome() {
    if (metrnomeInterval) {
      clearInterval(metrnomeInterval);
    }

    metrnomeInterval = null;
    currentBeatCount = 0;

    Howler.stop();
  }

  onMount(() => {
    // Save url for last used data
    lastUsedService.addLastUsed(page.url.pathname);
  });

  onDestroy(() => {
    Howler.stop();
    stopMetronome();
  });
</script>

<svelte:head>
  <title>Metronome | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Metronome" fallbackHref="/tools" />
    <section class="card">
      <div class="bpm-container grid-center space-above-lg">
        <h2 class="ui-xlg">{inputBpmAmount}</h2>
        <p class="text-body-subtle">BPM</p>
      </div>

      <div class="bpm-slider-container flex-row space-above-lg">
        <Button
          variant="outlined"
          size="icon-small"
          ariaLabel="Decrease Bpm Value by 1"
          onclick={() => handleBpmButtonPress(-1)}><Icon icon="minus" /></Button
        >
        <Slider
          min={40}
          max={240}
          bind:value={inputBpmAmount}
          onchange={handleInputChange}
          ariaLabel="Metronome Tempo"
          class="bpm-slider"
        />
        <Button
          variant="outlined"
          size="icon-small"
          ariaLabel="Increase Bpm Value by 1"
          onclick={() => handleBpmButtonPress(1)}><Icon icon="plus" /></Button
        >
      </div>

      <div class="play-input-container flex-row lay-gap-base space-above-lg">
        <Button size="icon-base" circle onclick={handlePlayPressed}>
          <Icon icon={metrnomeInterval ? "stop" : "playArrow"} />
        </Button>
        <TapComponent onTap={handleInputChange} bind:inputBpmAmount />
      </div>

      <hr class="space-above-xlg" />

      <div class="input-container grid-center">
        <div class="flex-col__input-label space-above-lg">
          <Label>Time Signature</Label>
          <div class="flex-row">
            <Select
              onchange={handleInputChange}
              bind:value={inputBeatCount}
              options={Array.from({ length: 16 }, (_, i) => ({
                label: `${i + 1}`,
                value: i + 1,
              }))}
            />
            <p>/</p>
            <Select
              onchange={handleInputChange}
              bind:value={inputBeatValueCount}
              options={[
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "4", value: 4 },
                { label: "8", value: 8 },
                { label: "16", value: 16 },
              ]}
            />
          </div>
        </div>

        <div class="flex-col__input-label space-above-base">
          <Label>Accent Beat Sound</Label>
          <Select
            onchange={handleInputChange}
            bind:value={accentSound}
            options={SFX_PERCUSSION_OPTIONS}
          />
        </div>
        <div class="flex-col__input-label space-above-base">
          <Label>Standar Beat Sound</Label>
          <Select
            onchange={handleInputChange}
            bind:value={standardSound}
            options={SFX_PERCUSSION_OPTIONS}
          />
        </div>
      </div>
    </section>
  </main>
</Wrapper>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: var(--space-16);

    width: 100%;
    padding: var(--app-padding);
  }

  .bpm-container {
    gap: 0;
  }

  .bpm-slider-container {
    gap: var(--space-16);

    max-width: 300px;
    margin-inline: auto;
  }
  :global(.custom-slider) {
    flex: 1;
  }

  .play-input-container {
    justify-content: center;
  }

  .flex-col__input-label {
    width: 100%;
    max-width: 300px;
  }
</style>
