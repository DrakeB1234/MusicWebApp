<script lang="ts">
  import { page } from "$app/state";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import RootNoteInput from "$lib/components/RootNoteInput.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";
  import { encodeUrlScale } from "$lib/helpers/helpers";
  import { getAllModes } from "$lib/helpers/musicTheory";
  import { onMount } from "svelte";

  let scales = getAllModes();
  let inputNote = $state("C");
  let inputAccidental = $state("n");
  let fullNote = $derived(
    inputNote + (inputAccidental === "n" ? "" : inputAccidental),
  );

  onMount(() => {
    // Save url for last used data
    lastUsedService.addLastUsed(page.url.pathname);
  });
</script>

<svelte:head>
  <title>Scales Library | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Scales Library" fallbackHref="/" />

    <section class="card">
      <RootNoteInput
        bind:noteValue={inputNote}
        bind:accidentalValue={inputAccidental}
      />

      <div class="scales-container flex-col space-above-lg">
        {#each scales as scale (scale)}
          <Button
            element="a"
            variant="outlined"
            href={encodeUrlScale(fullNote, scale)}
            class="lay-justify-start"
          >
            <div class="scale-button flex-col lay-gap-none">
              <p>{fullNote}&nbsp;{scale}</p>
              <p class="text-body-subtle">{scale}</p>
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
  .scale-button {
    align-items: start;
    padding: var(--space-4);
  }
</style>
