<script lang="ts">
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { onDestroy, onMount } from "svelte";
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import type { PageProps } from "./$types";
  import PianoSnapshot from "$lib/components/Piano/PianoSnapshot.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Toggle from "$lib/components/UI/Toggle.svelte";
  import { simplifyNoteName } from "$lib/helpers/musicTheory";

  // Values

  const playScaleDelayMs: number = 500;
  let playScaleInterval: ReturnType<typeof setInterval> | null = $state(null);
  let currentPlayedScaleIdx: number | null = $state(null);

  let isSimplifyNotesSelected = $state(false);

  let { data }: PageProps = $props();

  // Audio player handlers

  function handlePlayNote(index: number) {
    const note = data.scaleNotes[index];

    pianoAudioService.playNote(note, "med");
  }

  function handlePlayChord(triadIndex: number) {
    const triad = data.triads[triadIndex];

    if (!triad) return;

    pianoAudioService.playChord(triad.notes, "med");
  }

  // Play Scale Interval - Play all notes in scale

  function resetPlayScaleInterval() {
    if (playScaleInterval) {
      clearInterval(playScaleInterval);
      playScaleInterval = null;
      currentPlayedScaleIdx = null;
    }
  }

  function handlePlayScale() {
    resetPlayScaleInterval();

    // Start playing first note at call
    pianoAudioService.playNote(data.scaleNotes[0], "low");
    currentPlayedScaleIdx = 1;

    playScaleInterval = setInterval(() => {
      if (currentPlayedScaleIdx === null) currentPlayedScaleIdx = 1;
      if (currentPlayedScaleIdx >= data.scaleNotes.length) {
        resetPlayScaleInterval();
        return;
      }

      const currentNote = data.scaleNotes[currentPlayedScaleIdx];
      pianoAudioService.playNote(currentNote, "low");

      currentPlayedScaleIdx++;
    }, playScaleDelayMs);
  }

  // Svelte Methods

  onMount(() => {
    pianoAudioService.init();
  });

  onDestroy(() => {
    resetPlayScaleInterval();
    pianoAudioService.stopAll();
  });
</script>

<svelte:head>
  <title>{data.noteToken}&nbsp;{data.scaleToken} Scale | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Back"
      fallbackHref="/tools/scales-library"
    />

    <section class="card">
      <div class="scale-notes-header">
        <div>
          <h1>{data.noteToken}&nbsp;{data.scaleToken}&nbsp;Scale</h1>
        </div>
        <Button
          size="icon-small"
          onclick={handlePlayScale}
          disabled={playScaleInterval}
        >
          <Icon icon="volumeUp" />
        </Button>
      </div>
      <div class="toggle-button-container space-above-large">
        <Label labelFor="simplify-notes">Simplify Notes</Label>
        <Toggle
          bind:toggled={isSimplifyNotesSelected}
          id="simplify-notes"
          ariaLabel="Enable Simplified Notes"
        />
      </div>

      <hr class="space-above-base" />

      <div class="scale-notes-container lay-row">
        {#each data.scaleNotes as note, index (note)}
          {@const rawNote = note.letter + (note.accidental ?? "")}
          {@const displayNote = isSimplifyNotesSelected
            ? simplifyNoteName(rawNote)
            : rawNote}

          <Button
            variant="secondary"
            onclick={() => handlePlayNote(index)}
            state={currentPlayedScaleIdx === index + 1 ? "on" : "off"}
            >{displayNote}</Button
          >
        {/each}
      </div>

      <div class="piano-roll-container">
        <PianoSnapshot
          activeNotes={data.pianoRollNotes}
          range={{
            startNote: "C4",
            endNote: "B5",
          }}
        />
      </div>

      <hr class="divider" />

      <div class="card-high">
        <h3 class="text-heading-3">Numerals</h3>
        <div class="space-above-small lay-row lay-gap-4">
          {#each data.numerals as note (note)}
            <p class="separated-item">{note}</p>
          {/each}
        </div>

        <hr class="divider" />

        <h3 class="text-heading-3">
          Formula <span class="text-caption">(relative to major)</span>
        </h3>
        <div class="space-above-small lay-row lay-gap-4">
          {#each data.formula as note (note)}
            <p class="separated-item">{note}</p>
          {/each}
        </div>

        <hr class="divider" />
        <h3 class="text-heading-3">Relative Modes</h3>
        <p class="space-above-small">
          {data.relativeModes?.majorMode}&nbsp;|&nbsp;{data.relativeModes
            ?.minorMode}
        </p>
      </div>
    </section>

    <section class="card">
      <h2>Diatonic Chords</h2>

      <div class="lay-col space-above-small">
        {#each data.triads as triadObj, index (triadObj.name)}
          <Button
            variant="outlined"
            onclick={() => handlePlayChord(index)}
            class="lay-row--start-justify"
          >
            <div class="chord-button lay-row lay-gap-16">
              <h3 class="pill primary">{data.numerals[index]}</h3>
              <div class="text-container">
                <h3>{triadObj.tonic + triadObj.symbol}</h3>
                <div class="lay-row">
                  {#each triadObj.notes as note, i (note)}
                    {@const rawNote = note.letter + (note.accidental ?? "")}
                    {@const displayNote = isSimplifyNotesSelected
                      ? simplifyNoteName(rawNote)
                      : rawNote}
                    <p class="separated-item text-body-muted">
                      {displayNote}
                    </p>
                  {/each}
                </div>
              </div>
            </div>
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

  .toggle-button-container {
    width: fit-content;
    margin-left: auto;
  }

  .scale-notes-header {
    display: flex;
    gap: var(--space-16);
    justify-content: space-between;
    align-items: center;
  }

  .scale-notes-container {
    flex-wrap: wrap;

    padding-block: var(--space-16);
    padding-bottom: var(--space-24);
  }

  .piano-roll-container {
    width: 100%;
    padding-bottom: var(--space-4);

    margin-left: calc(-1 * var(--space-16));
    margin-right: calc(-1 * var(--space-16));

    overflow-x: auto;
  }

  .divider {
    margin-block: var(--space-16);
  }

  .chord-button {
    padding: var(--space-8);
    text-align: left;
  }

  .pill {
    min-width: 4ch;
  }
</style>
