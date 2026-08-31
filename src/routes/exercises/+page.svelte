<script>
  import IconDetailCardButton from "$lib/components/Cards/IconDetailCardButton.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";
  import { exercisesData } from "$lib/data/appData";
</script>

<svelte:head>
  <title>Exercises | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer
      headerText="Exercises"
      fallbackHref="/"
      useHistory={false}
    />

    <section class="card flex-col lay-gap-none space-above-base">
      {#each exercisesData as data, i (data.urlName)}
        <IconDetailCardButton
          icon={data.icon}
          color={data.color}
          title={data.name}
          description={data.description}
          href={data.href}
        />
        {#if i < exercisesData.length - 1}
          <hr />
        {/if}
      {/each}
    </section>
  </main>
</Wrapper>

<style>
  main {
    padding: var(--app-padding);
  }
  .card {
    padding: 0;
    overflow: hidden;
  }
</style>
