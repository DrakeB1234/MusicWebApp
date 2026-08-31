<script lang="ts">
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import { sfxAudioService } from "$lib/audio/sfxAudioService.svelte";
  import ExerciseLayout from "$lib/components/Exercises/ExerciseLayout.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { ConfigOptions } from "./helpers";
  import { Controller } from "./Controller.svelte";
  import { naturalNoteNames } from "$lib/helpers/musicTheoryConstants";
  import { midiService } from "$lib/midiservice/midiService.svelte";
  import MidiDeviceConnect from "$lib/components/MidiDeviceConnect.svelte";

  type Props = {
    config: ConfigOptions;
    handleExit: () => void;
  };

  let { config, handleExit }: Props = $props();

  let staffElement: HTMLDivElement | null = $state(null);
  // svelte-ignore state_referenced_locally
  const controller = new Controller(config);

  let activeInputAccidental = $state("");
  let playedMidiNote = $state("");

  function handleExitPressed() {
    handleExit();
  }

  function handleAccidentalInput(accidental: string) {
    if (activeInputAccidental === accidental) {
      activeInputAccidental = "";
      return;
    }
    activeInputAccidental = accidental;
  }

  function handleInput(noteLetter: string) {
    const fullNote = noteLetter + activeInputAccidental;
    controller.handleInput(fullNote);
  }

  onMount(() => {
    pianoAudioService.init();
    sfxAudioService.init();
    midiService.init();

    if (staffElement) controller.setupVectorScoreStaff(staffElement);

    const unsubscribe = midiService.subscribe((msg) => {
      if (msg.type === "noteOn" && msg.notes.length > 0) {
        controller.handleMidiInput(msg.notes[0]);
        playedMidiNote = msg.notes[0];
      }
    });

    return () => {
      unsubscribe();
      pianoAudioService.stopAll();
      sfxAudioService.stopAll();
      controller.destroy();
    };
  });
</script>

<main>
  <ExerciseLayout
    handleExitClick={handleExitPressed}
    gameContainerMessage={controller.currentMessage}
    gameContainerSnippet={gameContainer}
    scoreContainerSnippet={scoreContainer}
  />
  <div>
    <MidiDeviceConnect />
  </div>
  <div class="input flex-row space-above-base">
    <Button
      variant="outlined"
      size="large"
      state={activeInputAccidental === "#" ? "on" : "off"}
      onclick={() => handleAccidentalInput("#")}>#</Button
    >
    <Button
      variant="outlined"
      size="large"
      state={activeInputAccidental === "b" ? "on" : "off"}
      onclick={() => handleAccidentalInput("b")}>b</Button
    >
  </div>
  <div class="input flex-row space-above-sm">
    {#each naturalNoteNames as note}
      <Button variant="outlined" size="large" onclick={() => handleInput(note)}
        >{note}</Button
      >
    {/each}
  </div>
</main>

{#snippet gameContainer()}
  <div
    class="start-container grid-center"
    class:hide={controller.status !== "idle"}
  >
    <Button class="space-above-lg" onclick={() => controller.start()}
      >Start</Button
    >
  </div>
  <div
    class="staff-container"
    class:hide={controller.status !== "playing"}
    bind:this={staffElement}
  ></div>
{/snippet}
{#snippet scoreContainer()}
  <div class="score-item green">
    <p class="text-caption">Correct</p>
    <p class="text-heading-2">{controller.correctAnswers}</p>
  </div>
  <div class="score-item">
    <p class="text-caption">Time Left</p>
    <p class="text-heading-2">{controller.timer}</p>
  </div>
  <div class="score-item red">
    <p class="text-caption">Wrong</p>
    <p class="text-heading-2">{controller.wrongAnswers}</p>
  </div>
{/snippet}

<style>
  main {
    padding: var(--space-8) var(--space-12);
  }
  div.hide {
    display: none;
  }
  .start-container {
    padding-block: var(--space-8);
  }
  .staff-container {
    display: flex;
    justify-content: center;
    padding-block: var(--space-12);
  }
  .input {
    justify-content: center;
  }
</style>
