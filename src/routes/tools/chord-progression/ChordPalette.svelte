<script lang="ts">
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import RootNoteInput from "$lib/components/RootNoteInput.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import { getChord, getChordAbsoulteOctave } from "$lib/helpers/musicTheory";
  import { simpleChordSymbols } from "$lib/helpers/musicTheoryConstants";
  import type {
    DiatonicChordSet,
    GeneralChord,
  } from "$lib/helpers/musicTheoryTypes";
  import type { ProgressionPlayer } from "./chordProgressionPlayer.svelte";

  type Props = {
    playerRef: ProgressionPlayer;
    diatonicChords: DiatonicChordSet[] | null;
    secondaryDominants: DiatonicChordSet[] | null;
    borrowedChords: DiatonicChordSet[] | null;
  };
  let { playerRef, diatonicChords, secondaryDominants, borrowedChords }: Props =
    $props();

  let currentActiveTab: string = $state("diatonic");
  let isDiatonicPaletteAddMode = $state(true);

  let customRootNote: string = $state("C");
  let customRootAccidental: string = $state("n");
  let customRootSymbol: string = $state("maj");

  function handleCustomChordAdd() {
    const fixedAccidental =
      customRootAccidental === "n" ? "" : customRootAccidental;
    const chordObj = getChordAbsoulteOctave(
      customRootNote + fixedAccidental,
      customRootSymbol,
    );
    if (!chordObj) return;

    playerRef.progression.push({
      beats: 4,
      chordInfo: chordObj,
    });
  }

  function handleCustomChordPlay() {
    const fixedAccidental =
      customRootAccidental === "n" ? "" : customRootAccidental;
    const chordObj = getChord(
      customRootNote + fixedAccidental,
      customRootSymbol,
    );
    if (!chordObj) return;

    pianoAudioService.playChord(chordObj.notes, "high");
  }

  function handleTabChange(tab: string) {
    currentActiveTab = tab;
  }

  function handleChordButtonClick(
    degreeIdx: number,
    chordIdx: number,
    type: "diatonic" | "secondary dom" | "borrowed" = "diatonic",
  ) {
    let selectedChord: Pick<GeneralChord, "symbol" | "tonic"> | null = null;
    if (type === "diatonic" && diatonicChords) {
      selectedChord = diatonicChords[degreeIdx].chords[chordIdx];
    } else if (type === "secondary dom" && secondaryDominants) {
      selectedChord = secondaryDominants[degreeIdx].chords[chordIdx];
    } else if (type === "borrowed" && borrowedChords) {
      selectedChord = borrowedChords[degreeIdx].chords[chordIdx];
    }
    if (!selectedChord) return;

    const selectedChordObj = getChord(
      selectedChord.tonic,
      selectedChord.symbol,
    );
    if (!selectedChordObj) return;

    if (isDiatonicPaletteAddMode) {
      playerRef.progression.push({
        beats: 4,
        chordInfo: selectedChordObj,
      });
    } else {
      pianoAudioService.playChord(selectedChordObj.notes, "high");
    }
  }

  // Sends data to sibling component 'ProgressionTimeline' to add chord into timeline
  function handleDragStart(e: DragEvent, chord: any) {
    if (!e.dataTransfer) return;

    const payload = JSON.stringify({
      tonic: chord.tonic,
      symbol: chord.symbol,
    });

    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "copy";
  }
</script>

<section>
  <div class="tabs flex-row lay-gap-xsm">
    <Button
      variant="text"
      class="tabs__button"
      state={currentActiveTab === "diatonic" ? "on" : "off"}
      onclick={() => handleTabChange("diatonic")}
      aria-label="Toggle active chord tab to diatonic"
      title="Toggle active chord tab to diatonic">Diatonic</Button
    >
    <Button
      variant="text"
      class="tabs__button"
      state={currentActiveTab === "secondary dom" ? "on" : "off"}
      onclick={() => handleTabChange("secondary dom")}
      aria-label="Toggle active chord tab to secondary dom"
      title="Toggle active chord tab to secondary dom">Secondary Dom</Button
    >
    <Button
      variant="text"
      class="tabs__button"
      state={currentActiveTab === "borrowed" ? "on" : "off"}
      onclick={() => handleTabChange("borrowed")}
      aria-label="Toggle active chord tab to borrowed"
      title="Toggle active chord tab to borrowed">Borrowed</Button
    >
    <Button
      variant="text"
      class="tabs__button"
      state={currentActiveTab === "custom" ? "on" : "off"}
      onclick={() => handleTabChange("custom")}
      aria-label="Toggle active chord tab to custom"
      title="Toggle active chord tab to custom">Custom</Button
    >
  </div>

  <hr />

  <section
    class="diatonic-palette flex-col space-above-base"
    class:hide={currentActiveTab !== "diatonic"}
  >
    <div class="diatnoic-palette__volume-toggle">
      <Button
        variant="outlined"
        size="icon-small"
        state={isDiatonicPaletteAddMode ? "off" : "on"}
        onclick={() => (isDiatonicPaletteAddMode = !isDiatonicPaletteAddMode)}
        aria-label="Toggle add / hear chord mode"
        title="Toggle add / hear chord mode"
      >
        <Icon icon="volumeUp" />
      </Button>
    </div>
    {#each diatonicChords as diatonicObj, i (diatonicObj.degree)}
      <div class="diatonic-palette__section flex-row">
        <p class="diatonic-palette__degree">{diatonicObj.degree}</p>
        {#each diatonicObj.chords as chord, j (chord)}
          {@const chordName = `${chord.tonic}${chord.symbol}`}
          {@const instruction = isDiatonicPaletteAddMode
            ? "Click to add to timeline or drag."
            : "Click to hear audio."}

          <Button
            variant="secondary"
            class="diatonic-palette__chord-button"
            onclick={() => handleChordButtonClick(i, j)}
            draggable="true"
            ondragstart={(e: DragEvent) => handleDragStart(e, chord)}
            aria-label="{chordName}. {instruction}"
            title={instruction}
          >
            <p class="text-heading-3">{chord.tonic}{chord.symbol}</p>
          </Button>
        {/each}
      </div>
    {/each}
  </section>

  <section
    class="diatonic-palette flex-col space-above-base"
    class:hide={currentActiveTab !== "secondary dom"}
  >
    <div class="diatnoic-palette__volume-toggle">
      <Button
        variant="outlined"
        size="icon-small"
        state={isDiatonicPaletteAddMode ? "off" : "on"}
        onclick={() => (isDiatonicPaletteAddMode = !isDiatonicPaletteAddMode)}
        aria-label="Toggle add / hear chord mode"
        title="Toggle add / hear chord mode"
      >
        <Icon icon="volumeUp" />
      </Button>
    </div>
    {#each secondaryDominants as secondaryDominantObj, i (secondaryDominantObj.degree)}
      <div class="diatonic-palette__section flex-row">
        <p class="diatonic-palette__degree">{secondaryDominantObj.degree}</p>
        {#each secondaryDominantObj.chords as chord, j (chord)}
          {@const chordName = `${chord.tonic}${chord.symbol}`}
          {@const instruction = isDiatonicPaletteAddMode
            ? "Click to add to timeline or drag."
            : "Click to hear audio."}

          <Button
            variant="secondary"
            class="diatonic-palette__chord-button"
            onclick={() => handleChordButtonClick(i, j, "secondary dom")}
            draggable="true"
            ondragstart={(e: DragEvent) => handleDragStart(e, chord)}
            aria-label="{chordName}. {instruction}"
            title={instruction}
          >
            <p class="text-heading-3">{chord.tonic}{chord.symbol}</p>
          </Button>
        {/each}
      </div>
    {/each}
  </section>

  <section
    class="diatonic-palette flex-col space-above-base"
    class:hide={currentActiveTab !== "borrowed"}
  >
    <div class="diatnoic-palette__volume-toggle">
      <Button
        variant="outlined"
        size="icon-small"
        state={isDiatonicPaletteAddMode ? "off" : "on"}
        onclick={() => (isDiatonicPaletteAddMode = !isDiatonicPaletteAddMode)}
        aria-label="Toggle add / hear chord mode"
        title="Toggle add / hear chord mode"
      >
        <Icon icon="volumeUp" />
      </Button>
    </div>
    {#each borrowedChords as borrowedChordObj, i (borrowedChordObj.degree)}
      <div class="diatonic-palette__section flex-row">
        <p class="diatonic-palette__degree">{borrowedChordObj.degree}</p>
        {#each borrowedChordObj.chords as chord, j (chord)}
          {@const chordName = `${chord.tonic}${chord.symbol}`}
          {@const instruction = isDiatonicPaletteAddMode
            ? "Click to add to timeline or drag."
            : "Click to hear audio."}

          <Button
            variant="secondary"
            class="diatonic-palette__chord-button"
            onclick={() => handleChordButtonClick(i, j, "borrowed")}
            draggable="true"
            ondragstart={(e: DragEvent) => handleDragStart(e, chord)}
            aria-label="{chordName}. {instruction}"
            title={instruction}
          >
            <p class="text-heading-3">{chord.tonic}{chord.symbol}</p>
          </Button>
        {/each}
      </div>
    {/each}
  </section>

  <section
    class="flex-col space-above-base"
    class:hide={currentActiveTab !== "custom"}
  >
    <RootNoteInput
      bind:noteValue={customRootNote}
      bind:accidentalValue={customRootAccidental}
    />
    <div class="custom__chord-select space-above-sm">
      <Select bind:value={customRootSymbol} options={simpleChordSymbols} />
    </div>
    <div class="custom__buttons flex-row lay-gap-base space-above-base">
      <Button variant="secondary" fullWidth onclick={handleCustomChordPlay}
        >Play</Button
      >
      <Button fullWidth onclick={handleCustomChordAdd}>Add</Button>
    </div>
  </section>
</section>

<style>
  .hide {
    display: none;
  }
  .tabs {
    padding-bottom: var(--space-12);
    overflow-x: auto;
  }
  .tabs :global(.tabs__button:hover:not([data-state="on"])) {
    background-color: var(--color-bg-page-active);
  }
  .tabs :global(.tabs__button) {
    flex-shrink: 0;
  }
  .diatonic-palette {
    min-width: 0;
    overflow-x: auto;
  }
  .diatonic-palette__section {
    align-items: stretch;
  }
  .diatonic-palette__degree {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    max-width: 7ch;
    margin: 0;
    padding-right: var(--space-16);

    border-right: 1px solid var(--color-border);
  }
  .diatonic-palette :global(.diatonic-palette__chord-button) {
    justify-content: center;
    width: 10ch;
    padding-block: var(--space-12);
  }
  .custom__chord-select {
    width: fit-content;
  }
  .custom__buttons {
    max-width: 300px;
  }
</style>
