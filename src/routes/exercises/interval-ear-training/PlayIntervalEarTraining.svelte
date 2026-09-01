<script lang="ts">
  import Modal from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import { onDestroy, onMount } from "svelte";
  import { IntervalEarTrainingController } from "./intervalEarTrainingController.svelte";
  import type { IntervalEarConfig } from "./intervalEarTrainingHelpers";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import ConfirmationModalCard from "$lib/components/Modal/ConfirmationModalCard.svelte";
  import ExerciseLayout from "$lib/components/Exercises/ExerciseLayout.svelte";

  type Props = {
    config: IntervalEarConfig;
    handleExit: () => void;
  };

  let { config, handleExit }: Props = $props();

  // svelte-ignore state_referenced_locally
  const exerciseController = new IntervalEarTrainingController(config);

  let isExitModalOpen = $state(false);
  let staffElement: HTMLDivElement | null = $state(null);

  function handleExitPressed() {
    if (exerciseController.isExerciseOver) {
      handleExit();
    } else {
      isExitModalOpen = true;
    }
  }

  function handleExitModalResponse(wantsExit: boolean) {
    if (wantsExit) {
      handleExit();
    }
    isExitModalOpen = false;
  }

  onMount(() => {
    if (staffElement) exerciseController.setupVectorScoreStaff(staffElement);
  });

  onDestroy(() => {
    Howler.stop();
    exerciseController.destroy();
  });
</script>

<main>
  <ExerciseLayout
    handleExitClick={handleExitPressed}
    gameContainerMessage={exerciseController.currentMessage}
    gameContainerSnippet={gameContainer}
    scoreContainerSnippet={scoreContainer}
  />
  <div class="input-wrapper">
    {#each exerciseController.selectedIntervals as intervalObj (intervalObj.interval)}
      <Button
        variant="text"
        style="padding: 0;"
        onclick={() =>
          exerciseController.handleIntervalButtonClick(intervalObj.interval)}
      >
        <div
          class="input-container"
          class:correct={exerciseController.correctGuessInterval ===
            intervalObj.interval}
          class:wrong={exerciseController.wrongGuessInterval ===
            intervalObj.interval}
        >
          <p>{intervalObj.name}</p>
        </div>
      </Button>
    {/each}
  </div>
  <div class="bottom-container flex-row">
    <Button
      variant="secondary"
      size="icon-large"
      circle
      onclick={exerciseController.handleReplayIntervalClick}
    >
      <Icon icon="volumeUp" />
    </Button>
    <Button
      size="icon-large"
      circle
      onclick={exerciseController.handleNextButtonClick}
      disabled={exerciseController.isNextQuestionDisabled}
    >
      <Icon icon="arrowRightAlt" />
    </Button>
  </div>
</main>

{#snippet gameContainer()}
  <div class="staff-container" bind:this={staffElement}></div>
{/snippet}
{#snippet scoreContainer()}
  <div class="score-item green">
    <p class="text-caption">Correct</p>
    <p class="text-heading-2">{exerciseController.correctAnswers}</p>
  </div>
  <div class="score-item">
    <p class="text-caption">Question</p>
    <p class="text-heading-2">
      {exerciseController.questionNumber}/{config.questionsAmount}
    </p>
  </div>
  <div class="score-item red">
    <p class="text-caption">Wrong</p>
    <p class="text-heading-2">{exerciseController.wrongAnswers}</p>
  </div>
{/snippet}

<Modal bind:isOpen={isExitModalOpen}>
  <ConfirmationModalCard
    title="Exit Exercise"
    message="Are you sure you want to exit this exercise? You still have questions left to answer."
    confirmationText="Exit"
    onResponse={handleExitModalResponse}
  />
</Modal>

<style>
  main {
    padding: var(--space-8) var(--space-12);
  }

  .staff-container {
    display: flex;
    justify-content: center;
    padding-block: var(--space-12);
  }

  .input-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11em, 1fr));
    align-items: stretch;
    gap: var(--space-8);
    padding-bottom: var(--space-16);
  }
  .input-container {
    width: 100%;
    text-align: center;

    padding: var(--space-12);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
  }
  .input-container.correct {
    border-color: var(--color-bg-addon-green-contrast);
  }
  .input-container.wrong {
    border-color: var(--color-bg-addon-red-contrast);
  }

  .bottom-container {
    position: sticky;
    bottom: 0;

    justify-content: end;
    gap: var(--space-12);

    padding-block: var(--space-16);
  }
</style>
