<script lang="ts">
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { PageProps } from "./$types";
  import PianoSnapshot from "$lib/components/Piano/PianoSnapshot.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import {
    getFullNoteNameFromObj,
    simplifyNoteName,
  } from "$lib/helpers/musicTheory";
  import Toggle from "$lib/components/UI/Toggle.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import { encodeUrlChord } from "$lib/helpers/helpers";

  // Constants

  const startingOctave = 4;
  let { data }: PageProps = $props();

  // Data

  let {
    chordObj,
    chordInversions,
    chordIntervals,
    chordAliases,
    similarChords,
    secondaryDominantChord,
    fullNoteNames,
  } = $derived(data);

  let isChordInversions = $derived(data.chordInversions !== null);
  let isSimplifyNotesSelected = $state(false);
  let currentInversionSelected = $state(0);
  let pianoSnapshotNotes = $derived(fullNoteNames);

  // Functions

  function handlePlayNote(index: number) {
    const note = chordObj.notes[index];
    if (note.octave === null) return;

    pianoAudioService.playNote(note, "med");
  }

  // Considers currently selected chord inversion, then plays those notes. Root inversion is set by default
  function handlePlayChord() {
    if (!chordInversions) {
      pianoAudioService.playChord(chordObj.notes);
    } else {
      pianoAudioService.playChord(
        chordInversions[currentInversionSelected].chord.notes,
      );
    }
  }

  function handleInversionPressed(i: number) {
    if (!chordInversions) return;

    currentInversionSelected = i;
    const selectedInversionNotes = chordInversions[i].chord.notes;
    const noteFullNames = selectedInversionNotes.map((e) =>
      getFullNoteNameFromObj(e),
    );

    pianoSnapshotNotes = noteFullNames;
  }

  onMount(() => {
    pianoAudioService.init();
  });

  onDestroy(() => {
    pianoAudioService.stopAll();
  });

  $effect(() => {
    currentInversionSelected = 0;
  });
</script>

<svelte:head>
  <title>{data.chordObj.tonic}{data.chordObj.symbol} Chord | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Back"
      fallbackHref="/tools/chords-library"
    />

    <section class="card">
      <div class="chord-header">
        <div>
          <h1>
            {chordObj.tonic + chordObj.symbol}
          </h1>
          <p class="text-body-subtle">{chordObj.name}</p>
        </div>
        <Button onclick={handlePlayChord} size="icon-small">
          <Icon icon="volumeUp" />
        </Button>
      </div>

      <div class="aliases-container flex-row">
        {#each chordAliases as alias (alias)}
          <p class="pill">{alias}</p>
        {/each}
      </div>

      <div class="simple-toggle-container flex-row space-above-base">
        <Label labelFor="simplify-notes">Simplify Notes</Label>
        <Toggle
          bind:toggled={isSimplifyNotesSelected}
          id="simplify-notes"
          ariaLabel="Enable Simplified Notes"
        />
      </div>

      <hr class="divider space-above-base" />

      <div class="note-buttons-container flex-row space-above-base">
        {#each chordObj.notes as note, index (note)}
          {@const rawNote = note.letter + (note.accidental ?? "")}
          {@const displayNote = isSimplifyNotesSelected
            ? simplifyNoteName(rawNote)
            : rawNote}

          <Button variant="secondary" onclick={() => handlePlayNote(index)}>
            {displayNote}
          </Button>
        {/each}
      </div>

      <div class="piano-roll-container">
        <PianoSnapshot
          activeNotes={pianoSnapshotNotes}
          range={{
            startNote: "C4",
            endNote: "C7",
          }}
        />
      </div>

      <div class="card-high">
        <h3>Intervals</h3>
        <div class="flex-row lay-gap-xsm">
          {#each chordIntervals as interval (interval)}
            <p class="text-separated text-body-subtle">{interval}</p>
          {/each}
        </div>
        <h3 class="space-above-base">
          Secondary Dominant <span class="text-body-subtle"
            >(perfect 5th above root)</span
          >
        </h3>
        <p class="text-body-subtle">
          {secondaryDominantChord?.tonic}{secondaryDominantChord?.symbol}
        </p>
      </div>

      {#if isChordInversions}
        <h3 class="space-above-base">Inversions</h3>
        <div class="flex-col space-above-xsm">
          {#each chordInversions as inversion, index (index)}
            <Button
              variant="outlined"
              state={currentInversionSelected === index ? "on" : "off"}
              onclick={() => handleInversionPressed(index)}
              class="lay-justify-start"
            >
              <div class="inversion-button flex-row lay-gap-base">
                <p class="inversion-pill pill primary">
                  {inversion.inversionName}
                </p>
                <div class="flex-col lay-align-start lay-gap-none">
                  <p>{inversion.chord.tonic + inversion.chord.symbol}</p>
                  <div class="flex-row lay-gap-none">
                    {#each inversion.chord.notes as note}
                      {@const rawNote = note.letter + (note.accidental ?? "")}
                      {@const displayNote = isSimplifyNotesSelected
                        ? simplifyNoteName(rawNote)
                        : rawNote}

                      <p class="text-separated text-body-subtle">
                        {displayNote}&nbsp;
                      </p>
                    {/each}
                  </div>
                </div>
              </div>
            </Button>
          {/each}
        </div>
      {/if}
    </section>

    <section>
      <h3>Similar Chords</h3>

      <hr class="space-above-sm" />

      <div class="similar-chords-container">
        {#each similarChords as chord}
          <Button
            element="a"
            variant="text"
            href={encodeUrlChord(chord.tonic!, chord.symbol)}
            class="similar-chord-button flex-col lay-align-start"
          >
            <p>{chord.tonic + chord.symbol}</p>
            <p class="text-body-subtle">{chord.name}</p>
          </Button>
        {/each}
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

  .chord-header {
    display: flex;
    justify-content: space-between;
    align-items: start;

    margin-bottom: var(--space-12);
  }

  .aliases-container {
    gap: var(--space-4);
    overflow-x: auto;
  }

  .note-buttons-container {
    flex-wrap: wrap;
  }

  .piano-roll-container {
    overflow-x: auto;

    /* Full Bleed, Negative margin */
    margin-left: calc(-1 * var(--space-16));
    margin-right: calc(-1 * var(--space-16));

    margin-block: var(--space-24);
  }

  .simple-toggle-container {
    width: fit-content;
    margin-left: auto;
  }

  .inversion-button {
    padding-block: var(--space-8);
  }

  .inversion-pill {
    width: 5ch;
  }

  .similar-chords-container {
    display: grid;
    gap: var(--space-8);

    margin-top: var(--space-16);
  }

  :global(.btn.similar-chord-button) {
    padding: var(--space-16);
    background-color: var(--color-bg-surface-1);
    border: 1px solid var(--color-border-subtle);
    gap: var(--space-0);
    box-shadow: var(--shadow-1);
  }
</style>
