<script lang="ts">
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
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

  const player = new ProgressionPlayer();

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
    pianoAudioService.init();

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
  });

  onDestroy(() => {
    player.stop();
    pianoAudioService.resetVolumeToDefault();
  });
</script>

<svelte:head>
  <title>Chord Progression | Tone Tools</title>
</svelte:head>

<main>
  <div class="action-bar-wrapper">
    <ActionBar playerRef={player} bind:currentScale />
  </div>
  <div class="content-wrapper">
    <div class="timeline-wrapper lay-grid-col">
      <p>Timeline</p>
      <ProgressionTimeline playerRef={player} bind:activeProgressionObjIndex />
      {#if player.isPlaying}
        <p>Current Chord: {player.currentPlayedChord}</p>
      {/if}
    </div>
    <div class="chord-palette-wrapper space-above-xlarge lay-grid-col">
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
    background-color: var(--color-bg-surface-1);
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .content-wrapper {
    max-width: 1400px;
    margin-inline: auto;
    padding: var(--space-16) var(--space-24);
  }
  .timeline-wrapper {
    position: relative;
  }
  @media (max-width: 768px) {
    .content-wrapper {
      padding: var(--space-16) var(--space-12);
    }
  }
</style>
