<script lang="ts">
  import { goto } from "$app/navigation";
  import IconDetailCardButton from "$lib/components/Cards/IconDetailCardButton.svelte";
  import Modal from "$lib/components/Modal/Modal.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Input from "$lib/components/UI/Input.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";
  import { convertNoteNameToMidi } from "$lib/helpers/musicTheory";
  import { onMount } from "svelte";
  import {
    defaultConfig,
    StaffTypeNoteRanges,
    validateNoteRange,
    type ConfigOptions,
    type NoteRange,
  } from "./helpers";
  import NoteRangeModal from "./NoteRangeModal.svelte";
  import { page } from "$app/state";

  let configOptions: ConfigOptions = $state(defaultConfig);
  let currentStaffTypeNoteRange = $derived(
    StaffTypeNoteRanges[configOptions.clef],
  );
  let isNoteRangeModalOpen = $state(false);

  function handleClefChange() {
    const currentLowMidi = convertNoteNameToMidi(configOptions.noteRange.low);
    const currentHighMidi = convertNoteNameToMidi(configOptions.noteRange.high);
    const staffLowMidi = convertNoteNameToMidi(currentStaffTypeNoteRange.low);
    const staffHighMidi = convertNoteNameToMidi(currentStaffTypeNoteRange.high);
    if (!currentLowMidi || !currentHighMidi || !staffLowMidi || !staffHighMidi)
      return;

    if (currentLowMidi < staffLowMidi) {
      configOptions.noteRange.low = currentStaffTypeNoteRange.low;
    }
    if (currentHighMidi > staffHighMidi) {
      configOptions.noteRange.high = currentStaffTypeNoteRange.high;
    }
  }

  function handleAccidentalClick(accidental: "n" | "#" | "b") {
    const currentAccidentals = configOptions.allowedAccidentals;
    if (currentAccidentals.includes(accidental)) {
      if (currentAccidentals.length === 1) return;
      configOptions.allowedAccidentals = currentAccidentals.filter(
        (a) => a !== accidental,
      );
    } else {
      configOptions.allowedAccidentals = [...currentAccidentals, accidental];
    }
  }

  function handleModalFinished(confirmed: boolean, newRange?: NoteRange) {
    if (confirmed && newRange) {
      const validatedRange = validateNoteRange(
        newRange.low,
        newRange.high,
        currentStaffTypeNoteRange.low,
        currentStaffTypeNoteRange.high,
      );
      if (!validatedRange) return;

      configOptions = {
        ...configOptions,
        noteRange: validatedRange,
      };
    }
    isNoteRangeModalOpen = false;
  }

  function onStartClick() {
    const snapshotConfig = $state.snapshot(configOptions);

    goto("/exercises/sight-reading/play", {
      state: {
        config: snapshotConfig,
      },
    });
  }

  onMount(() => {
    // Save url for last used data
    lastUsedService.addLastUsed(page.url.pathname);
  });
</script>

<svelte:head>
  <title>Sight Reading | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Sight Reading"
      fallbackHref="/"
      useHistory={false}
    />

    <section class="top-card card">
      <IconDetailCardButton
        icon="stacks"
        color="purple"
        title="Presets"
        description="Choose from pre-made sight reading exercises."
        href="/exercises/sight-reading/presets"
      />
    </section>

    <section class="card">
      <Button onclick={onStartClick}>Start Exercise</Button>
      <hr class="space-above-base" />
      <p class="space-above-base">Config</p>
      <div class="flex-col space-above-base lay-gap-base">
        <div class="input flex-col__input-label">
          <Label labelFor="clef">Clef</Label>
          <Select
            id="clef"
            bind:value={configOptions.clef}
            onchange={handleClefChange}
            options={[
              { label: "Grand", value: "grand" },
              { label: "Treble", value: "treble" },
              { label: "Bass", value: "bass" },
            ]}
          />
        </div>
        <div class="input flex-col__input-label">
          <Label labelFor="timer">Timer</Label>
          <Input
            id="timer"
            type="number"
            min="1"
            max="60"
            placeholder="60"
            bind:value={configOptions.timer}
          />
        </div>
        <div class="input flex-col__input-label">
          <p class="text-caption">Note Range</p>
          <p class="text-heading-3">
            {configOptions.noteRange.low} - {configOptions.noteRange.high}
          </p>
          <Button
            variant="outlined"
            class="space-above-sm"
            onclick={() => (isNoteRangeModalOpen = true)}>Set Note Range</Button
          >
        </div>

        <div class="flex-col__input-label">
          <p class="text-caption">Accidentals</p>
          <div class="flex-row">
            <Button
              variant="outlined"
              state={configOptions.allowedAccidentals.includes("n")
                ? "on"
                : "off"}
              onclick={() => handleAccidentalClick("n")}>n</Button
            >
            <Button
              variant="outlined"
              state={configOptions.allowedAccidentals.includes("#")
                ? "on"
                : "off"}
              onclick={() => handleAccidentalClick("#")}>#</Button
            >
            <Button
              variant="outlined"
              state={configOptions.allowedAccidentals.includes("b")
                ? "on"
                : "off"}
              onclick={() => handleAccidentalClick("b")}>b</Button
            >
          </div>
        </div>
      </div>
    </section>
  </main>
</Wrapper>

<Modal bind:isOpen={isNoteRangeModalOpen}>
  <NoteRangeModal
    currentRange={configOptions.noteRange}
    currentStaffType={configOptions.clef}
    {currentStaffTypeNoteRange}
    onResponse={handleModalFinished}
  />
</Modal>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: var(--space-16);

    width: 100%;
    padding: var(--app-padding);
  }
  .top-card {
    padding: 0;
    overflow: hidden;
  }
  .input {
    max-width: 250px;
  }
</style>
