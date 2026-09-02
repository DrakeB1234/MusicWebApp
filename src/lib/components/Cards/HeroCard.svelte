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

    <div class="space-above-base">
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

    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    border: none;
    background: linear-gradient(
      90deg,
      rgba(38, 115, 238, 1) 47%,
      rgb(82, 171, 222) 100%
    );
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
</style>
