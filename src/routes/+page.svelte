<script>
  import HeroCard from "$lib/components/Cards/HeroCard.svelte";
  import LastUsedCard from "$lib/components/Cards/LastUsedCard.svelte";
  import ToolCard from "$lib/components/Cards/ToolCard.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { exercisesData, toolsData } from "$lib/data/appData";
  import { lastUsedService } from "$lib/data/lastUsedService.svelte";

  const allItems = [...exercisesData, ...toolsData];

  const lastUsedItems = $derived(
    lastUsedService.lastUsedIdsList
      .map((e) => allItems.find((item) => item.href === e))
      .filter((item) => item !== undefined),
  );
</script>

<svelte:head>
  <title>Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <HeroCard />

    <section class="content">
      <p class="text-heading-3">Last Used</p>

      <div class="last-used flex-row space-above-base">
        {#each lastUsedItems as item}
          <LastUsedCard
            title={item.name}
            description={item.description}
            color={item.color}
            icon={item.icon}
            href={item.href}
          />
        {/each}
      </div>
    </section>

    <hr />

    <section class="content">
      <p class="text-heading-3">Exercises</p>

      <div class="lay-grid-cards space-above-base">
        {#each exercisesData as item}
          <ToolCard
            title={item.name}
            description={item.description}
            href={item.href}
            color={item.color}
            icon={item.icon}
          />
        {/each}
      </div>
    </section>

    <hr />

    <section class="content">
      <p class="text-heading-3">Tools</p>

      <div class="lay-grid-cards space-above-base">
        {#each toolsData as item}
          <ToolCard
            title={item.name}
            description={item.description}
            href={item.href}
            color={item.color}
            icon={item.icon}
          />
        {/each}
      </div>
    </section>
  </main>
</Wrapper>

<style>
  main {
    width: 100%;
  }

  .content {
    padding: var(--space-36) var(--space-12);
  }

  .last-used {
    align-items: stretch;
    padding-bottom: var(--space-8);
    padding-right: var(--space-36);
    overflow-x: auto;

    mask-image: linear-gradient(
      to right,
      black 0%,
      black 96%,
      transparent 100%
    );
  }

  .lay-grid-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: stretch;
    gap: var(--space-8);
  }

  @media (min-width: 600px) {
    .lay-grid-cards {
      grid-template-columns: repeat(auto-fill, minmax(14em, 1fr));
      gap: var(--space-12);
    }

    .last-used {
      gap: var(--space-12);
    }
  }
</style>
