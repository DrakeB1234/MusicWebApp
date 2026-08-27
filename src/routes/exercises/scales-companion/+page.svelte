<script lang="ts">
  import Icon from "$lib/components/Icons/Icon.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Wrapper from "$lib/components/Wrapper.svelte";

  function handleKeySelect(newKey: string) {
    console.log(newKey);
  }
</script>

<svelte:head>
  <title>Scales Companion | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <div class="page-header">
      <PageHeaderContainer headerText="Scales Companion" fallbackHref="/" />
    </div>

    <section class="header-card card space-above-base">
      <div class="header lay-row">
        <h3 class="header__text text-heading-1">C Major</h3>
        <Button variant="text" size="icon-base">
          <Icon icon="settings" />
        </Button>
      </div>
    </section>
  </main>
</Wrapper>

<style>
  .page-header {
    padding: var(--app-padding);
    padding-bottom: 0;
  }
  .header-card {
    margin: var(--app-padding);
  }
  .header {
    justify-content: space-between;
  }
  .header__text {
    padding-left: var(--space-16);
  }
</style>
