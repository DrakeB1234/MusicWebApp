<script lang="ts">
  import ConfirmationModalCard from "$lib/components/Modal/ConfirmationModalCard.svelte";
  import Modal from "$lib/components/Modal/Modal.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { statsDataService } from "$lib/data/intervalEarTrainingDataService";
  import { getIntervalName } from "$lib/helpers/musicTheory";

  let isModalOpen = $state(false);

  let latestStats = $state(statsDataService.getStats());
  let statsArray = $derived(
    Object.entries(latestStats).map(([interval, stats]) => {
      const total = stats.correct + stats.wrong;

      return {
        interval,
        name: getIntervalName(interval),
        correct: stats.correct,
        wrong: stats.wrong,
        correctPercent:
          total > 0 ? Math.round((stats.correct / total) * 100) : 0,
        wrongPercent: total > 0 ? Math.round((stats.wrong / total) * 100) : 0,
      };
    }),
  );

  function handleResetDataPressed() {
    isModalOpen = true;
  }

  function handleResetModalResponse(confirmed: boolean) {
    if (confirmed) {
      statsDataService.resetSessionStats();
      latestStats = {};
    }
    isModalOpen = false;
  }
</script>

<svelte:head>
  <title>Guided Intervals Ear Training | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Stats Intervals"
      fallbackHref="/exercises/interval-ear-training"
    />

    <section class="card flex-col">
      {#each statsArray as stat (stat.interval)}
        <div class="interval-stat flex-row">
          <div class="interval-stat__text">
            <p class="text-heading-3">{stat.interval}</p>
            <p class="text-caption">{stat.name}</p>
          </div>
          <div class="interval-stat__stats flex-col">
            <div class="flex-row lay-gap-none">
              {#if stat.correctPercent > 0}
                <span class="stat correct" style="width: {stat.correctPercent}%"
                ></span>
              {/if}
              {#if stat.wrongPercent > 0}
                <span class="stat wrong" style="width: {stat.wrongPercent}%"
                ></span>
              {/if}
            </div>
            <div class="stats__text flex-row">
              <p>Correct {stat.correct}</p>
              <p>Wrong {stat.wrong}</p>
            </div>
          </div>
        </div>
      {:else}
        <div class="no-data flex-col">
          <p class="text-heading-3">No data found.</p>
          <p>Try playing some more exercises to see your stats!</p>
        </div>
      {/each}
    </section>
    <div class="reset-stats flex-row space-above-base">
      <Button variant="destructive-outlined" onclick={handleResetDataPressed}
        >Reset Data</Button
      >
    </div>
  </main>
</Wrapper>

<Modal isOpen={isModalOpen}>
  <ConfirmationModalCard
    title="Reset Stats"
    message="Are you sure you want to reset ALL of your stats data? This action is irreversible."
    confirmationText="Reset"
    onResponse={handleResetModalResponse}
  />
</Modal>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: var(--space-16);

    width: 100%;
    padding: var(--app-padding);
  }
  .no-data {
    padding: var(--space-16);
  }
  .interval-stat {
    padding-block: var(--space-16);
  }
  .interval-stat__text {
    padding-inline: var(--space-8);
    min-width: 11ch;
  }
  .interval-stat__stats {
    width: 100%;
  }
  .stat {
    height: 3px;
  }
  .stat.correct {
    background-color: var(--color-bg-success);
  }
  .stat.wrong {
    background-color: var(--color-bg-danger);
  }
  .stats__text {
    justify-content: space-between;
  }
  .reset-stats {
    justify-content: end;
  }
</style>
