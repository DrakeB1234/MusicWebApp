<script lang="ts">
  import { goto } from "$app/navigation";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { presets } from "../helpers";

  function handlePresetClick(idx: number) {
    const presetObj = presets[idx];
    if (!presetObj) return;

    goto("/exercises/sight-reading/play", {
      state: {
        config: presetObj.config,
      },
    });
  }
</script>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Presets Sight Reading"
      fallbackHref="/exercises/sight-reading"
      useHistory={false}
    />

    <section class="card">
      <div class="title">
        <h3>Beginner</h3>
      </div>
      {#each presets as preset, i (preset.name)}
        <Button
          variant="text"
          fullWidth
          class="preset-link__button"
          onclick={() => handlePresetClick(i)}
        >
          <div class="preset-link flex-col lay-gap-none">
            <p class="text-heading-3">{preset.name}</p>
            <p class="text-caption-subtle space-above-xsm text-max-width-base">
              {preset.description}
            </p>
            <div
              class="preset-link__pills flex-row lay-gap-xsm space-above-base"
            >
              <p class="pill flex-row lay-gap-xsm">
                <Icon icon="musicNote" size="var(--icon-size-sm)" />
                {preset.config.noteRange.low} - {preset.config.noteRange.high}
              </p>
              <p class="pill flex-row lay-gap-xsm">
                <Icon icon="timer" size="var(--icon-size-sm)" />
                {preset.config.timer}
              </p>
            </div>
          </div>
        </Button>
        {#if i < presets.length - 1}
          <hr />
        {/if}
      {/each}
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
    padding-bottom: var(--space-16);
  }
  .title {
    padding: var(--space-16);
  }
  .card :global(.preset-link__button) {
    justify-content: start;
    text-align: left;
  }
  .preset-link {
    padding: var(--space-4);
  }
  .preset-link__pills {
    flex-wrap: wrap;
    align-items: stretch;
  }
  .preset-link__pills > .pill {
    height: 100%;
  }
</style>
