<script lang="ts">
  import { page } from "$app/state";
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import PianoRoll from "$lib/components/Piano/PianoRoll.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";
  import { encodeUrlChord } from "$lib/helpers/helpers";
  import {
    convertMidiToNoteName,
    convertNoteNameToObj,
    detectChordsByNoteNames,
    sortNoteNames,
  } from "$lib/helpers/musicTheory";
  import { onDestroy, onMount } from "svelte";

  let selectedNotes: string[] = $state([]);
  let identifiedChords = $derived(detectChordsByNoteNames(selectedNotes));

  function handlePianoNoteClick(midi: number) {
    const noteName = convertMidiToNoteName(midi);

    if (noteName) {
      if (selectedNotes.includes(noteName)) {
        selectedNotes = selectedNotes.filter((n) => n !== noteName);
      } else {
        selectedNotes = [...selectedNotes, noteName];

        pianoAudioService.playNote(convertNoteNameToObj(noteName), "low");
      }

      selectedNotes = sortNoteNames(selectedNotes);
    }
  }

  function handleResetNotesPressed() {
    selectedNotes = [];
  }

  onMount(() => {
    // Save url for last used data
    lastUsedService.addLastUsed(page.url.pathname);
  });

  onDestroy(() => {
    Howler.stop();
  });
</script>

<svelte:head>
  <title>Identify Chord | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Indentify Chord" fallbackHref="/" />

    <section class="card">
      <PianoRoll
        activeNotes={selectedNotes}
        range={{
          startNote: "C4",
          endNote: "E7",
        }}
        overflowScroll
        interactive
        onNoteClick={handlePianoNoteClick}
      />

      <div class="card-content space-above-base">
        <div class="flex-row">
          <p>Selected Notes:</p>
          <Button
            variant="text"
            size="icon-small"
            title="reset all notes"
            onclick={handleResetNotesPressed}
          >
            <Icon icon="refresh" />
          </Button>
        </div>
        <div class="notes-container flex-row space-above-sm">
          {#each selectedNotes as note}
            <p class="text-separated">{note}</p>
          {/each}
        </div>
      </div>
    </section>

    <section class="flex-col space-above-base">
      <h3>Results</h3>
      <hr />
      <div class="chords-container">
        {#each identifiedChords as chord (chord.tonic + chord.symbol)}
          <Button
            element="a"
            variant="text"
            href={encodeUrlChord(chord.tonic!, chord.symbol)}
            class="link-card flex-col lay-align-start"
          >
            <p>{chord.tonic + chord.symbol}</p>
            <div class="notes-container flex-row">
              {#each chord.notes as note (note)}
                <p class="text-separated text-body-subtle">{note}</p>
              {/each}
            </div>
          </Button>
        {:else}
          <div class="empty-container">
            <p class="text-body-subtle">No chords found</p>
          </div>
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

  .card {
    padding: 0;
    padding-bottom: var(--space-8);
    overflow: hidden;
  }

  .card-content {
    padding: var(--space-12);
  }

  .notes-container {
    flex-wrap: wrap;
    gap: var(--space-4);

    width: 100%;
    min-height: 21px;
  }

  .chords-container {
    display: grid;
    gap: var(--space-8);
  }

  .empty-container {
    display: flex;
    justify-content: center;

    padding: var(--space-12) var(--space-16);
  }

  :global(.btn.link-card) {
    padding: var(--space-16);
    background-color: var(--color-bg-surface-1);
    border: 1px solid var(--color-border-subtle);
    gap: var(--space-0);
    box-shadow: var(--shadow-1);
  }
</style>
