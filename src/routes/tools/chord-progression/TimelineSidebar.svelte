<script lang="ts">
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import StepperInput from "$lib/components/UI/StepperInput.svelte";
  import type { ProgressionPlayer } from "./chordProgressionPlayer.svelte";
  import { switchIndexInArrayInPlace } from "$lib/helpers/helpers";
  import Select from "$lib/components/UI/Select.svelte";
  import {
    getAccidentalFromNoteName,
    getChordAbsoulteOctave,
    getLetterFromNoteName,
  } from "$lib/helpers/musicTheory";
  import {
    accidentalNames,
    naturalNoteNames,
    simpleChordSymbols,
  } from "$lib/helpers/musicTheoryConstants";

  type Props = {
    playerRef: ProgressionPlayer;
    activeProgressionObjIndex: number | null;
  };
  let { playerRef, activeProgressionObjIndex = $bindable() }: Props = $props();

  let currentProgressionObj = $derived(
    activeProgressionObjIndex !== null
      ? playerRef.progression[activeProgressionObjIndex]
      : null,
  );
  let currentProgressionChord = $derived(
    currentProgressionObj?.chordInfo ?? null,
  );
  let isSidebarOpen = $derived(activeProgressionObjIndex !== null);
  let maxPositionIndex = $derived(playerRef.progression.length);

  // Draft object meant for deriving current state of input values, then allowing for local mutation
  // of those values
  type ChordDraft = {
    duration: number;
    position: number;
    note: string;
    accidental: string;
    symbol: string;
  };
  let chordDraft = $state<ChordDraft | null>(null);

  $effect(() => {
    const obj = currentProgressionObj;
    const index = activeProgressionObjIndex;

    if (obj === null || index === null || obj.chordInfo === null) {
      chordDraft = null;
      return;
    }

    const tonic = obj.chordInfo.tonic;
    const accidental = getAccidentalFromNoteName(tonic);
    const note = getLetterFromNoteName(tonic) ?? "C";

    chordDraft = {
      duration: obj.beats,
      position: index + 1,
      note,
      accidental,
      symbol: obj.chordInfo.symbol,
    };
  });

  function onDurationStepperClick(direction: number) {
    if (!chordDraft) return;
    chordDraft.duration += direction;
  }

  function onPositionStepperClick(direction: number) {
    if (!chordDraft) return;
    const tempPosition = chordDraft.position + direction;
    if (tempPosition < 1 || tempPosition > maxPositionIndex) return;
    chordDraft.position = tempPosition;
  }

  function handleApplyClick() {
    if (activeProgressionObjIndex === null || chordDraft === null) return;
    let progressionRef = playerRef.progression[activeProgressionObjIndex];
    progressionRef.beats = chordDraft.duration;

    if (chordDraft.position !== activeProgressionObjIndex + 1) {
      switchIndexInArrayInPlace(
        playerRef.progression,
        activeProgressionObjIndex,
        chordDraft.position - 1,
      );
    }

    const localProgressionChord = currentProgressionObj?.chordInfo ?? null;
    if (
      localProgressionChord?.tonic !== chordDraft.note ||
      getAccidentalFromNoteName(localProgressionChord.tonic) !==
        chordDraft.accidental ||
      localProgressionChord.symbol !== chordDraft.symbol
    ) {
      const fixedAccidental =
        chordDraft.accidental === "n" ? "" : chordDraft.accidental;
      const newChordObj = getChordAbsoulteOctave(
        chordDraft.note + fixedAccidental,
        chordDraft.symbol,
      );
      if (newChordObj) {
        progressionRef.chordInfo = newChordObj;
      }
    }

    activeProgressionObjIndex = null;
  }

  function handleRemoveClick() {
    if (activeProgressionObjIndex === null) return;
    playerRef.progression.splice(activeProgressionObjIndex, 1);
    activeProgressionObjIndex = null;
  }

  function handleCancelClick() {
    activeProgressionObjIndex = null;
  }
</script>

<button
  class="sidebar-backdrop"
  class:hide={!isSidebarOpen}
  onclick={handleCancelClick}
  tabindex="-1"
  aria-label="Close progression chord editor"
></button>

<aside class="timeline-sidebar-wrapper" class:hide={!isSidebarOpen}>
  {#if currentProgressionChord && chordDraft}
    <div class="timeline-sidebar">
      <div class="timeline-sidebar__header flex-row lay-gap-none">
        <div class="flex-col lay-gap-none">
          <p class="text-caption">Edit Chord</p>
          <p class="text-heading-3">
            {currentProgressionChord.tonic}{currentProgressionChord.symbol}
          </p>
        </div>
        <div>
          <Button
            variant="text"
            size="icon-small"
            onclick={handleCancelClick}
            aria-label="Close progression chord editor"
          >
            <Icon icon="close" />
          </Button>
        </div>
      </div>
      <div class="timeline-sidebar__content">
        <div class="flex-col__input-label">
          <Label labelFor="duration">Duration</Label>
          <StepperInput
            id="duration"
            value={chordDraft.duration}
            onStepperClick={onDurationStepperClick}
          />
        </div>
        <div class="flex-col__input-label space-above-base">
          <Label labelFor="position">Position</Label>
          <StepperInput
            id="position"
            value={chordDraft.position}
            onStepperClick={onPositionStepperClick}
          />
        </div>
        <hr class="space-above-base" />
        <p class="text-heading-3 space-above-base">Change Chord</p>
        <div class="note-input flex-row space-above-sm">
          <div class="flex-col__input-label">
            <Label labelFor="note">Note</Label>
            <Select
              id="note"
              bind:value={chordDraft.note}
              options={naturalNoteNames}
            />
          </div>
          <div class="flex-col__input-label">
            <Label labelFor="accidental">Acc</Label>
            <Select
              id="accidental"
              bind:value={chordDraft.accidental}
              options={accidentalNames}
            />
          </div>
          <div class="note-input__chord flex-col__input-label">
            <Label labelFor="chord">Chord</Label>
            <Select
              id="chord"
              bind:value={chordDraft.symbol}
              options={simpleChordSymbols}
            />
          </div>
        </div>

        <div class="timeline-sidebar__bottom-buttons space-above-lg flex-row">
          <Button variant="destructive-outlined" onclick={handleRemoveClick}>
            <Icon icon="delete" size="var(--icon-size-sm)" />
            Remove
          </Button>
          <Button onclick={handleApplyClick}>Apply</Button>
        </div>
      </div>
    </div>
  {/if}
</aside>

<style>
  .sidebar-backdrop {
    appearance: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: default;

    position: fixed;
    inset: 0;
    z-index: 1;
    background-color: transparent;
  }
  .timeline-sidebar-wrapper {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 99;
  }
  .hide {
    display: none;
  }
  .timeline-sidebar {
    min-width: 300px;
    height: 100%;

    background-color: var(--color-bg-surface-1);
    border-left: 1px solid var(--color-border-subtle);
    box-shadow: var(--shadow-3);
  }
  .timeline-sidebar__header {
    justify-content: space-between;
    align-items: start;
    padding: var(--space-12);

    border-bottom: 1px solid var(--color-border-subtle);
  }
  .timeline-sidebar__content {
    padding: var(--space-12);
  }
  .timeline-sidebar__bottom-buttons {
    align-items: stretch;
    justify-content: space-between;
  }
  .note-input {
    flex-wrap: wrap;
    gap: var(--space-8);
  }
  .note-input__chord {
    flex: 1;
    min-width: 80px;
  }
</style>
