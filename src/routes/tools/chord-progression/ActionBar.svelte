<script lang="ts">
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PianoMiniRoll from "$lib/components/Piano/PianoMiniRoll.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Input from "$lib/components/UI/Input.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Popover from "$lib/components/UI/Popover.svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import Slider from "$lib/components/UI/Slider.svelte";
  import Toggle from "$lib/components/UI/Toggle.svelte";
  import { getAllModes } from "$lib/helpers/musicTheory";
  import { keyNamesFlatted } from "$lib/helpers/musicTheoryConstants";
  import { styleLibrary } from "./chordProgressionHelpers";
  import type { ProgressionPlayer } from "./chordProgressionPlayer.svelte";

  type Props = {
    playerRef: ProgressionPlayer;
    currentScale: string;
  };

  let { playerRef, currentScale = $bindable() }: Props = $props();

  const styleSelectOptions = Object.values(styleLibrary).map((e) => {
    return {
      value: e.id,
      label: e.name,
    };
  });
  const styleIds = Object.values(styleLibrary).map((e) => e.id);

  let popoverStyleRef = $state<HTMLElement>();
  let popoverKeyRef = $state<HTMLElement>();

  let localStyleId = $state(playerRef.currentStyleData.id);
  let localVolumeValue = $state(pianoAudioService.volumeValue);
  let localBPMValue = $state(playerRef.bpm);
  let localKeyValue = $state(playerRef.globalKey);
  let localScaleValue = $state(currentScale);
  let localAutoTranposeValue = $state(true);
  let localAutoVoicingValue = $state(playerRef.autoMelodyChordInversions);

  let isPianoRollOpen = $state(false);

  function handleVolumeChanged() {
    if (isNaN(localVolumeValue)) return;
    pianoAudioService.changeServiceVolume(localVolumeValue);
    localVolumeValue = pianoAudioService.volumeValue;
  }

  function handleAutoVoicingToggled() {
    localAutoVoicingValue = !localAutoVoicingValue;
    playerRef.autoMelodyChordInversions = localAutoVoicingValue;
  }

  function handleBPMChanged() {
    if (localBPMValue < 40 || localBPMValue > 240) localBPMValue = 120;
    playerRef.bpm = localBPMValue;
  }

  function handlePopoverStyleApplyClick() {
    if (!styleIds.includes(localStyleId)) return;

    playerRef.changeStyleById(localStyleId);
    popoverStyleRef?.hidePopover();
  }

  function handleCancelStylePopoverClick() {
    if (!popoverStyleRef) return;
    popoverStyleRef.hidePopover();
  }

  function handlePopoverKeyApplyClick() {
    playerRef.changeKey(localKeyValue, localAutoTranposeValue);
    currentScale = localScaleValue;

    popoverKeyRef?.hidePopover();
  }

  function handleCancelKeyPopoverClick() {
    if (!popoverKeyRef) return;
    popoverKeyRef.hidePopover();
  }

  // Updates local values when popover opens
  function handlePopoverToggle(e: Event) {
    const toggleEvent = e as ToggleEvent;

    if (toggleEvent.newState === "open") {
      localStyleId = playerRef.currentStyleData.id;
      localKeyValue = playerRef.globalKey;
      localScaleValue = currentScale;
      localAutoTranposeValue = true;
      localBPMValue = playerRef.bpm;
      localAutoVoicingValue = playerRef.autoMelodyChordInversions;
    }
  }
</script>

<section class="action-bar flex-row">
  <div class="action-bar__button-container">
    <Button
      size="icon-base"
      circle
      onclick={playerRef.togglePlay}
      aria-label="Toggle chord progression playing"
    >
      <Icon icon={playerRef.isPlaying ? "stop" : "playArrow"} />
    </Button>
  </div>
  <div class="action-bar__button-container">
    <Button
      variant="secondary"
      size="icon-base"
      state={isPianoRollOpen ? "on" : "off"}
      circle
      onclick={() => (isPianoRollOpen = !isPianoRollOpen)}
      aria-label="Toggle show piano roll visualizer"
    >
      <Icon icon="piano" />
    </Button>
  </div>

  <Button
    variant="text"
    popovertarget="popover-volume"
    aria-label="Open change volume settings"
  >
    <div class="flex-col__input-label lay-gap-none">
      <p class="text-body-subtle">Volume</p>
      <p class="text-heading-3">{pianoAudioService.volumeValue}</p>
    </div>
  </Button>
  <Popover id="popover-volume">
    <div class="grid-col lay-gap-base">
      <Label labelFor="input-volume">Volume {localVolumeValue}</Label>
      <Slider
        id="input-volume"
        min={0}
        max={100}
        bind:value={localVolumeValue}
        onchange={handleVolumeChanged}
      />
    </div>
  </Popover>

  <Button
    variant="text"
    popovertarget="popover-bpm"
    aria-label="Open change BPM settings"
  >
    <div
      class="action-bar__button-container flex-col__input-label lay-gap-none"
    >
      <p class="text-body-subtle">BPM</p>
      <p class="text-heading-3">{playerRef.bpm}</p>
    </div>
  </Button>
  <Popover id="popover-bpm" ontoggle={handlePopoverToggle}>
    <div class="flex-col__input-label">
      <Label labelFor="input-bpm">BPM</Label>
      <Input
        id="input-bpm"
        type="number"
        min="40"
        max="240"
        bind:value={localBPMValue}
        onchange={handleBPMChanged}
      />
    </div>
  </Popover>

  <Button
    variant="text"
    popovertarget="popover-key"
    aria-label="Open change key settings"
  >
    <div
      class="action-bar__button-container flex-col__input-label lay-gap-none"
    >
      <p class="text-body-subtle">Key</p>
      <p class="text-heading-3 text-truncate">{playerRef.globalKey}</p>
    </div>
  </Button>
  <Popover
    id="popover-key"
    bind:ref={popoverKeyRef}
    ontoggle={handlePopoverToggle}
  >
    <div>
      <div class="flex-col__input-label">
        <Label labelFor="input-key">Key</Label>
        <Select
          id="input-key"
          bind:value={localKeyValue}
          options={keyNamesFlatted}
        />
      </div>
      <div class="flex-col__input-label space-above-sm">
        <Label labelFor="input-scale">Scale</Label>
        <Select
          id="input-scale"
          bind:value={localScaleValue}
          options={getAllModes()}
        />
      </div>
      <div class="flex-col__input-label space-above-sm">
        <Label labelFor="toggle-auto-transpose">Tranpose Chords</Label>
        <Toggle
          id="toggle-auto-transpose"
          bind:toggled={localAutoTranposeValue}
        />
      </div>

      <div class="popover__bottom-buttons-container flex-row space-above-base">
        <Button
          variant="secondary"
          onclick={handleCancelKeyPopoverClick}
          aria-label="Cancel changes to music style">Cancel</Button
        >
        <Button
          onclick={handlePopoverKeyApplyClick}
          aria-label="Apply changes to music style">Apply</Button
        >
      </div>
    </div>
  </Popover>

  <Button
    variant="text"
    popovertarget="popover-style"
    aria-label="Open change music style settings"
  >
    <div
      class="action-bar__button-container flex-col__input-label lay-gap-none"
    >
      <p class="text-body-subtle">Style</p>
      <p class="text-heading-3 text-truncate">
        {playerRef.currentStyleData.name}
      </p>
    </div>
  </Button>
  <Popover
    id="popover-style"
    bind:ref={popoverStyleRef}
    ontoggle={handlePopoverToggle}
  >
    <div>
      <div class="flex-col__input-label">
        <Label labelFor="music-style">Music Style</Label>
        <Select
          id="music-style"
          bind:value={localStyleId}
          options={styleSelectOptions}
        />
      </div>
      <div class="popover__bottom-buttons-container flex-row space-above-base">
        <Button
          variant="secondary"
          onclick={handleCancelStylePopoverClick}
          aria-label="Cancel changes to music style">Cancel</Button
        >
        <Button
          onclick={handlePopoverStyleApplyClick}
          aria-label="Apply changes to music style">Apply</Button
        >
      </div>
    </div>
  </Popover>

  <Button
    variant="text"
    popovertarget="popover-auto-voicing"
    aria-label="Open change auto voicing settings"
  >
    <div
      class="action-bar__button-container flex-col__input-label lay-gap-none"
    >
      <p class="text-body-subtle">Voicing</p>
      <p class="text-heading-3 text-truncate">
        {localAutoVoicingValue ? "Auto" : "None"}
      </p>
    </div>
  </Button>
  <Popover id="popover-auto-voicing" ontoggle={handlePopoverToggle}>
    <div class="flex-col__input-label">
      <Label labelFor="input-auto-voicing">Auto Voicing</Label>
      <Toggle
        id="input-auto-voicing"
        toggled={localAutoVoicingValue}
        onchange={handleAutoVoicingToggled}
      />
    </div>
  </Popover>
</section>

<div class="piano-roll-wrapper" class:hide={!isPianoRollOpen}>
  <hr />
  <section class="piano-roll">
    <PianoMiniRoll activeNotes={playerRef.currentPlayedNotes} />
  </section>
</div>

<style>
  .action-bar {
    gap: var(--space-8);
    padding: var(--space-8) var(--space-12);
    overflow-x: auto;
  }
  .action-bar__button-container {
    max-width: 80px;
    flex-shrink: 0;
  }
  .popover__bottom-buttons-container {
    justify-content: end;
  }
  .piano-roll-wrapper hr {
    width: calc(100% - var(--space-36));
    max-width: 1400px;
    padding-inline: var(--space-8);
    margin: auto;
  }
  .piano-roll {
    padding-top: var(--space-12);
    max-width: 1200px;
    margin: auto;
  }
  .hide {
    display: none;
  }
</style>
