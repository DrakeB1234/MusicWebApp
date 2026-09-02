<script lang="ts">
  import {
    getBorrowedChordsFromScale,
    getChordAbsoulteOctave,
    getDiatonicChordsFromScale,
    getSecondaryDominantsFromScale,
  } from "$lib/helpers/musicTheory";
  import { onDestroy, onMount } from "svelte";
  import { ProgressionPlayer } from "./chordProgressionPlayer.svelte";
  import { styleLibrary } from "./chordProgressionHelpers";
  import ActionBar from "./ActionBar.svelte";
  import ProgressionTimeline from "./ProgressionTimeline.svelte";
  import ChordPalette from "./ChordPalette.svelte";
  import TimelineSidebar from "./TimelineSidebar.svelte";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";
  import { page } from "$app/state";

  const player = new ProgressionPlayer();
  const initialMasterVolume = Howler.volume() * 100;

  let currentScale = $state("major");
  let diatonicChords = $derived(
    getDiatonicChordsFromScale(player.globalKey, currentScale),
  );
  let secondaryDominants = $derived(
    getSecondaryDominantsFromScale(player.globalKey, currentScale),
  );
  let borrowedChords = $derived(
    getBorrowedChordsFromScale(player.globalKey, currentScale),
  );
  let activeProgressionObjIndex = $state<number | null>(null);

  onMount(() => {
    const startingProgression = [
      { chordInfo: getChordAbsoulteOctave("D", "m7"), beats: 4 },
      { chordInfo: getChordAbsoulteOctave("G", "7"), beats: 4 },
      { chordInfo: getChordAbsoulteOctave("C", "maj7"), beats: 4 },
      { chordInfo: getChordAbsoulteOctave("A", "7"), beats: 4 },
    ];
    const startStyleString = Object.keys(styleLibrary)[0];
    const startingStyle = styleLibrary[startStyleString].id;

    // Init progression with chords that MATCH key arg
    player.initPlayer(startingStyle, "C", startingProgression);

    // Save url for last used data
    lastUsedService.addLastUsed(page.url.pathname);
  });

  onDestroy(() => {
    player.stop();
    Howler.volume(initialMasterVolume / 100);
  });
</script>

<svelte:head>
  <title>Chord Progression | Tone Tools</title>
</svelte:head>

<main>
  <div class="content-wrapper">
    <div class="action-bar-wrapper">
      <ActionBar playerRef={player} bind:currentScale />
    </div>
    <div class="timeline-wrapper grid-col space-above-lg">
      <p>Timeline</p>
      <ProgressionTimeline playerRef={player} bind:activeProgressionObjIndex />
      <p class="current-chord-text">
        {player.currentPlayedChord &&
          `Current Chord: ${player.currentPlayedChord}`}
      </p>
    </div>
    <div class="chord-palette-wrapper space-above-xlg grid-col">
      <p>Chord Palette</p>
      <ChordPalette
        playerRef={player}
        {diatonicChords}
        {secondaryDominants}
        {borrowedChords}
      />
    </div>
  </div>
</main>
<TimelineSidebar playerRef={player} bind:activeProgressionObjIndex />

<style>
  .action-bar-wrapper {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    overflow: hidden;
  }
  .content-wrapper {
    max-width: 1400px;
    margin-inline: auto;
    padding: var(--space-12) var(--space-24);
  }
  .timeline-wrapper {
    position: relative;
  }

  .current-chord-text {
    min-height: 1.5rem;
  }
  @media (max-width: 768px) {
    .content-wrapper {
      padding: var(--space-16) var(--space-12);
    }
  }
</style>
