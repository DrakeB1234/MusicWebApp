<script>
  import DAW from "../Icons/DAW.svelte";
  import Icon from "../Icons/Icon.svelte";
  import Button from "../UI/Button.svelte";
</script>

<div class="card">
  <div class="content">
    <div class="flex-row">
      <Icon icon={DAW} color="var(--color-on-bg-primary)" />

      <h1 class="text-heading-2">Chord Progression Creator</h1>
    </div>
    <p class="text-caption text-max-width-base space-above-base">
      Experiment with chords and choose between various styles to hear your
      progression in!
    </p>

    <div class="space-above-lg">
      <Button element="a" class="hero-button" href="/tools/chord-progression">
        Open Tool
        <Icon icon="arrowRightAlt" />
      </Button>
    </div>
  </div>
</div>

<style>
  .card {
    position: relative;
    padding: var(--space-24) var(--space-24);
    padding-bottom: var(--space-16);

    box-shadow: var(--shadow-2);
    background-color: var(--color-bg-primary);
    overflow: hidden;
  }
  .content {
    position: relative;
    z-index: 1;
    max-width: 90%;
  }
  .content h1,
  .content p {
    color: var(--color-on-bg-primary);
  }
  .card::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 12%;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 0;
  }
  .card :global(.hero-button) {
    border-color: var(--color-on-bg-primary);
  }
</style>
