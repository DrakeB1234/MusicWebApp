<script>
  import HeroCard from "$lib/components/Cards/HeroCard.svelte";
  import LastUsedCard from "$lib/components/Cards/LastUsedCard.svelte";
  import ToolCard from "$lib/components/Cards/ToolCard.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { exercisesData, toolsData } from "$lib/data/appData";

  const lastUsedItems = [
    exercisesData[0],
    toolsData[0],
    toolsData[1],
    exercisesData[1],
  ];
</script>

<svelte:head>
  <title>Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <HeroCard />

    <section class="space-above-large">
      <h3>Last Used</h3>

      <div class="last-used lay-row space-above-base">
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

    <hr class="space-above-base" />

    <section class="space-above-large">
      <h3>Exercises</h3>

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

    <section class="space-above-large">
      <h3>Tools</h3>

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
    padding: var(--app-padding);
  }

  .last-used {
    padding-bottom: var(--space-8);
    overflow-x: auto;
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
