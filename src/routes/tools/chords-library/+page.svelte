<script lang="ts">
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { getAllCategoryChords } from "$lib/helpers/musicTheory";
  import { chordCategories } from "$lib/helpers/musicTheoryConstants";
  import Button from "$lib/components/UI/Button.svelte";
  import RootNoteInput from "$lib/components/RootNoteInput.svelte";
  import { encodeUrlChord } from "$lib/helpers/helpers";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";

  let inputNote = $state("C");
  let inputAccidental = $state("n");
  let inputChordCategory = $state("Common");
  let categoryChords = $derived(getAllCategoryChords(inputChordCategory) ?? []);

  let fullNote = $derived(
    inputNote + (inputAccidental === "n" ? "" : inputAccidental),
  );

  function handleChordCategoryButtonPressed(category: string) {
    inputChordCategory = category;
  }
</script>

<svelte:head>
  <title>Chords Library | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Chord Library" fallbackHref="/" />

    <section class="card">
      <div class="input-group">
        <RootNoteInput
          bind:noteValue={inputNote}
          bind:accidentalValue={inputAccidental}
        />
      </div>

      <div class="toggle-buttons-container">
        {#each chordCategories as category (category)}
          <Button
            variant="outlined"
            state={inputChordCategory === category ? "on" : "off"}
            onclick={() => handleChordCategoryButtonPressed(category)}
            aria-label="Show chords under category {category}"
            >{category}</Button
          >
        {/each}
      </div>

      <div class="chord-categories-container">
        {#each categoryChords as chord (chord.symbol)}
          <Button
            element="a"
            variant="outlined"
            href={encodeUrlChord(fullNote, chord.symbol)}
            class="lay-row--start-justify"
          >
            <div class="chord-button lay-col lay-gap-0">
              <p>{fullNote + chord.symbol}</p>
              <p class="text-body-muted text-truncate">{chord.name}</p>
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

  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .toggle-buttons-container {
    display: flex;
    overflow-x: auto;
    gap: var(--space-8);

    padding-top: 2px;
    padding-bottom: var(--space-12);
    margin-top: var(--space-36);
  }

  .chord-categories-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    gap: var(--space-8);

    margin-top: var(--space-16);
  }

  .chord-button {
    align-items: start;
    padding: var(--space-4);
    overflow: hidden;
  }

  .chord-button p {
    max-width: 100%;
  }

  @media (max-width: 768px) {
    .chord-categories-container {
      grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
    }
  }
</style>
