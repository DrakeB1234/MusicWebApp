<script lang="ts">
  import { goto } from "$app/navigation";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Modal from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { intervalObjs } from "$lib/helpers/musicTheoryConstants";
  import type { IntervalEntry } from "$lib/helpers/musicTheoryTypes";
  import { defaultConfig } from "./intervalEarTrainingHelpers";
  import ConfigModalCard from "./ConfigModalCard.svelte";
  import IconDetailCardButton from "$lib/components/Cards/IconDetailCardButton.svelte";

  let configOptions = $state(defaultConfig);
  let activeIntervalStrings: string[] = $derived(
    configOptions.selectedIntervals.map((e) => e.interval),
  );

  let isConfigOpen = $state(false);

  function handleIntervalButtonClick(interval: IntervalEntry) {
    const isAlreadySelected = configOptions.selectedIntervals.some(
      (i) => i.interval === interval.interval,
    );

    if (isAlreadySelected) {
      configOptions.selectedIntervals = configOptions.selectedIntervals.filter(
        (i) => i.interval !== interval.interval,
      );
    } else {
      configOptions.selectedIntervals = [
        ...configOptions.selectedIntervals,
        interval,
      ];
    }
  }

  function onModalFinished() {
    isConfigOpen = false;
  }

  function onStartClick() {
    configOptions.selectedIntervals.sort((a, b) => {
      const indexA = intervalObjs.findIndex(
        (obj) => obj.interval === a.interval,
      );
      const indexB = intervalObjs.findIndex(
        (obj) => obj.interval === b.interval,
      );

      return indexA - indexB;
    });
    const snapshotConfig = $state.snapshot(configOptions);

    goto("/exercises/interval-ear-training/play", {
      state: {
        config: snapshotConfig,
      },
    });
  }
</script>

<svelte:head>
  <title>Intervals Ear Training | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Intervals Ear Training"
      fallbackHref="/"
      useHistory={false}
    />

    <section class="top-card card">
      <IconDetailCardButton
        icon="book"
        color="purple"
        title="Guided"
        description="Learn intervals through a guided set of exercises."
        href="/exercises/interval-ear-training/guided"
      />
      <hr />
      <IconDetailCardButton
        icon="leaderBoard"
        color="green"
        title="Stats"
        description="Check out how well you can indentify each interval."
        href="/exercises/interval-ear-training/stats"
      />
    </section>

    <section class="card">
      <div class="flex-row">
        <Button onclick={onStartClick}>Start Exercise</Button>
        <Button variant="secondary" onclick={() => (isConfigOpen = true)}>
          Configure
        </Button>
      </div>

      <p class="space-above-lg">Selected Intervals</p>
      <div class="flex-col space-above-sm">
        {#each intervalObjs as interval (interval.interval)}
          <Button
            variant="outlined"
            state={activeIntervalStrings.includes(interval.interval)
              ? "on"
              : "off"}
            onclick={() => handleIntervalButtonClick(interval)}
            class="interval-button"
          >
            <div class="flex-row">
              <p class="interval-text">{interval.interval}</p>
              <p>{interval.name}</p>
            </div>
          </Button>
        {/each}
      </div>
    </section>
  </main>
</Wrapper>

<Modal bind:isOpen={isConfigOpen}>
  <ConfigModalCard
    bind:configData={configOptions}
    onComplete={onModalFinished}
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
  .top-card {
    padding: 0;
    overflow: hidden;
  }
  .interval-text {
    text-align: right;
    min-width: 3ch;
  }
  :global(.btn.interval-button) {
    justify-content: start;
    padding: var(--space-16);
  }
</style>
