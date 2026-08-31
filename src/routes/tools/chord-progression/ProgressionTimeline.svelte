<script lang="ts">
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import { switchIndexInArrayInPlace } from "$lib/helpers/helpers";
  import { getChordAbsoulteOctave } from "$lib/helpers/musicTheory";
  import type {
    DiatonicChordSet,
    GeneralChord,
  } from "$lib/helpers/musicTheoryTypes";
  import type { ProgressionStep } from "./chordProgressionHelpers";
  import type { ProgressionPlayer } from "./chordProgressionPlayer.svelte";

  type Props = {
    playerRef: ProgressionPlayer;
    activeProgressionObjIndex: number | null;
  };

  let { playerRef, activeProgressionObjIndex = $bindable() }: Props = $props();

  let progressionItems = $derived(playerRef.progression);
  let draggedChordIndex: number | null = $state(null);
  let isDragging = $state(false);

  function handleChordClick(index: number) {
    activeProgressionObjIndex = index;
  }

  function handleDragStart(e: DragEvent, index: number) {
    if (!e || !e.dataTransfer) return;
    draggedChordIndex = index;
    e.dataTransfer.effectAllowed = "move";
    isDragging = true;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  // Either place at pos shift preceding elements, or swap elements
  function handleDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();

    // Handles data sent from outside components (i.e. ChordPalette dropping chord)
    const externalChordData = e.dataTransfer?.getData("text/plain");
    if (externalChordData) {
      try {
        const parsedChord = JSON.parse(externalChordData);
        const newChordInfo = getChordAbsoulteOctave(
          parsedChord.tonic,
          parsedChord.symbol,
        );

        if (newChordInfo) {
          let copyProgressionArr = [...$state.snapshot(progressionItems)];

          copyProgressionArr.splice(targetIndex, 0, {
            chordInfo: newChordInfo,
            beats: 4,
          });

          playerRef.progression = copyProgressionArr;
        }
      } catch (err) {
        console.error("Failed to parse dropped chord data.");
      }

      return;
    }

    if (draggedChordIndex !== null && draggedChordIndex !== targetIndex) {
      let copyProgressionArr: ProgressionStep[] = [
        ...$state.snapshot(progressionItems),
      ];
      switchIndexInArrayInPlace(
        copyProgressionArr,
        draggedChordIndex,
        targetIndex,
      );

      playerRef.progression = copyProgressionArr;
    }
    draggedChordIndex = null;
  }

  function handleDropDelete(e: DragEvent) {
    e.preventDefault();
    if (draggedChordIndex !== null) {
      let copyProgressionArr: ProgressionStep[] = [
        ...$state.snapshot(progressionItems),
      ];
      copyProgressionArr.splice(draggedChordIndex, 1);

      playerRef.progression = copyProgressionArr;
    }
    draggedChordIndex = null;
  }

  function handleDragEnd() {
    draggedChordIndex = null;
    isDragging = false;
  }

  // Handles when a chord is dragged from palette, and dropped on the timeline itself rather than a timeline button directly.
  function handleTimelineContainerDrop(e: DragEvent) {
    e.preventDefault();

    const externalChordData = e.dataTransfer?.getData("text/plain");

    if (externalChordData) {
      try {
        const parsedChord = JSON.parse(externalChordData);
        const newChordInfo = getChordAbsoulteOctave(
          parsedChord.tonic,
          parsedChord.symbol,
        );

        if (newChordInfo) {
          let copyProgressionArr = [...$state.snapshot(progressionItems)];

          copyProgressionArr.push({
            chordInfo: newChordInfo,
            beats: 4,
          });

          playerRef.progression = copyProgressionArr;
        }
      } catch (err) {
        console.error("Failed to parse dropped chord data.");
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
  class="timeline card"
  ondragover={handleDragOver}
  ondrop={handleTimelineContainerDrop}
>
  {#each progressionItems as progressionItem, i (i)}
    {@const fullChordSymbol =
      progressionItem.chordInfo!.tonic + progressionItem.chordInfo!.symbol}
    {@const beatsText = progressionItem.beats > 1 ? "beats" : "beat"}
    <div
      class="chord-item grid-center"
      class:active={playerRef.isPlaying &&
        playerRef.currentProgressionIdx === i}
      draggable="true"
      ondragstart={(e) => handleDragStart(e, i)}
      ondragover={handleDragOver}
      ondrop={(e) => handleDrop(e, i)}
      ondragend={handleDragEnd}
      style="grid-column: span {progressionItem.beats}"
    >
      <div class="chord-item__drag-container">
        <Icon icon="dragHandle" />
      </div>
      <Button
        variant="text"
        draggable="false"
        class="chord-item__chord-button"
        fullWidth
        onclick={() => handleChordClick(i)}
      >
        <div class="chord-item__chord-container flex-col lay-gap-none">
          <p class="text-heading-3 text-truncate">{fullChordSymbol}</p>
          <p class="text-caption text-truncate">
            {progressionItem.beats}
            {beatsText}
          </p>
        </div>
      </Button>
    </div>
  {/each}
</section>
<div class="drag-remove grid-center" class:hide={!isDragging}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="drag-remove__remove-button"
    ondragover={handleDragOver}
    ondrop={(e) => handleDropDelete(e)}
  >
    <Icon icon="close" />
  </div>
</div>

<style>
  .timeline {
    display: grid;
    grid-template-columns: repeat(16, 1fr);
    grid-auto-rows: 1fr;
    gap: var(--space-8);
    padding: var(--space-12);
  }
  .chord-item {
    gap: 0;
    min-width: 0;
    border-radius: var(--radius-base);
    border: 1px solid var(--color-border);
  }
  .chord-item.active {
    background-color: var(--color-bg-primary-subtle);
    border: 1px solid var(--color-bg-primary);
  }
  .chord-item__drag-container {
    color: var(--color-on-bg-surface);
    cursor: grab;
  }
  .chord-item__chord-container {
    width: 100%;
    overflow: hidden;
    padding: var(--space-12) var(--space-8);
  }
  .timeline :global(.chord-item__chord-button) {
    min-width: 0;
    padding: 0;
  }
  .timeline :global(.chord-item.active .chord-item__chord-button:hover) {
    background-color: transparent;
  }

  .drag-remove {
    position: absolute;
    inset: auto 0 -4em 0;
  }
  .drag-remove.hide {
    display: none;
  }
  .drag-remove__remove-button {
    width: fit-content;
    padding: var(--space-16);

    border-radius: var(--radius-full);
    color: var(--color-on-bg-primary);
    background-color: var(--color-bg-danger);
  }

  @media (max-width: 600px) {
    .timeline {
      grid-template-columns: repeat(8, 1fr);
    }
  }
</style>
