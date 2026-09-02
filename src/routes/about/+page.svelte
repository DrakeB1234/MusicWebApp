<script lang="ts">
  import Wrapper from "$lib/components/Wrapper.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Button from "$lib/components/UI/Button.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Github from "$lib/components/Icons/Github.svelte";
</script>

<svelte:head>
  <title>About | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="About" fallbackHref="/" />

    <section class="card">
      <div class="about__logo flex-col">
        <img
          src="/icon-192x192.webp"
          alt="Tone Tools Logo"
          width="96"
          height="96"
        />
        <h2 class="text-heading-2 space-above-base">Tone Tools</h2>
      </div>
      <p class="text-body text-max-width-lg text-body-subtle space-above-sm">
        Tone Tools is a open source project aiming to provide useful music
        theory tools and exercises. If you like this project, be sure to leave a
        star on my github repo for this project!
      </p>
      <p class="text-body text-max-width-lg text-body-subtle space-above-base">
        I'm always open to suggestions; which can be expressed to me using the
        github repo linked below! I'd be happy to hear what you have to say!
      </p>
      <Button
        element="a"
        href="https://github.com/DrakeB1234/ToneTools"
        variant="outlined"
        class="space-above-xlg"
        target="_blank"
        rel="noreferrer"
        aria-label="View Tone Tools source code on GitHub"
      >
        <Icon icon={Github} />
        View on GitHub
      </Button>

      <hr class="space-above-base" />

      <div class="about__content">
        <h2 class="text-heading-2">Powered by</h2>
        <p class="text-body-subtle space-above-sm">
          Listed are some resources that I used to help build and make this
          project possible!
        </p>

        <h3 class="text-heading-3 space-above-base">Libraries & Frameworks</h3>
        <ul class="about-list">
          <li>
            <a href="https://howlerjs.com/" target="_blank" rel="noreferrer"
              >Howler.js</a
            > - Web audio library
          </li>
          <li>
            <a
              href="https://github.com/tonaljs/tonal"
              target="_blank"
              rel="noreferrer">Tonal.js</a
            > - Music theory utility
          </li>
          <li>
            <a
              href="https://github.com/DrakeB1234/VectorScore"
              target="_blank"
              rel="noreferrer">Vector Score</a
            > - Custom made SVG musical notation renderer
          </li>
        </ul>

        <h3 class="text-heading-3 space-above-base">Audio Samples</h3>
        <ul class="about-list">
          <li>
            <a
              href="https://github.com/sfzinstruments/SalamanderGrandPiano"
              target="_blank"
              rel="noreferrer">Salamander Grand Piano</a
            > - Main piano soundfont
          </li>
          <li>
            <strong>Sounds from Freesound.org -</strong>
            <a
              href="https://freesound.org/people/Sycopation/sounds/809908/"
              target="_blank"
              rel="noreferrer">Clave</a
            >,
            <a
              href="https://freesound.org/people/karolist/sounds/371192/"
              target="_blank"
              rel="noreferrer">Kick</a
            >,
            <a
              href="https://freesound.org/people/Druminfected/sounds/250552/"
              target="_blank"
              rel="noreferrer">Woodblock</a
            >,
            <a
              href="https://freesound.org/people/hollandm/sounds/692828/"
              target="_blank"
              rel="noreferrer">Soft Woodblock</a
            >,
            <a
              href="https://freesound.org/people/TheFlakesMaster/sounds/399897/"
              target="_blank"
              rel="noreferrer">Hi-Hat</a
            >,
            <a
              href="https://freesound.org/people/bdu/sounds/813/"
              target="_blank"
              rel="noreferrer">Open Hi-Hat</a
            >,
            <a
              href="https://freesound.org/people/LittleRainySeasons/sounds/335908/"
              target="_blank"
              rel="noreferrer">Correct Ping</a
            >,
            <a
              href="https://freesound.org/people/unadamlar/sounds/476177/"
              target="_blank"
              rel="noreferrer">Wrong Buzzer</a
            >
          </li>
        </ul>
      </div>

      <hr />

      <div class="about__content">
        <h2 class="text-heading-2">Inspirations</h2>
        <p class="text-body-subtle space-above-sm">
          Tone Tools pulled inspiration from these fantastic resources:
        </p>

        <div class="lay-grid-cards space-above-base">
          <ul class="about-list">
            <li>
              <a
                href="https://www.onemotion.com/chord-player/"
                target="_blank"
                rel="noreferrer">OneMotion</a
              > - UI and functionality for chord progression maker (check this one
              out!)
            </li>
            <li>
              <a
                href="https://whatchord.org/chords/B-flat"
                target="_blank"
                rel="noreferrer">WhatChord</a
              > - Chord Lookup tool
            </li>
            <li>
              <a
                href="https://poly.ozieblowski.dev/"
                target="_blank"
                rel="noreferrer">Ozieblowski Polyrhythms</a
              > - UI for polyrhythm tool
            </li>
            <li>
              <a href="https://4four.io/ploop" target="_blank" rel="noreferrer"
                >4four Ploop</a
              > - UI for polyrhythm tool
            </li>
            <li>
              <a href="https://taptempo.io/" target="_blank" rel="noreferrer"
                >TapTempo.io</a
              > - UI for metronome tool
            </li>
            <li>
              <a
                href="https://tonedear.com/ear-training/intervals"
                target="_blank"
                rel="noreferrer">TonedEar</a
              > - UI and functionality for interval training
            </li>
            <li>
              <a
                href="https://pianoscales.org/major.html"
                target="_blank"
                rel="noreferrer">PianoScales.org</a
              > - UI and data for scales library
            </li>
          </ul>
        </div>
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

  .about__content {
    padding-block: var(--space-24);
  }

  .about-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    padding-left: var(--space-16);

    list-style-type: disc;
    color: var(--color-on-bg-surface-subtle);
  }

  .about-list a {
    color: var(--color-bg-primary);
    font-weight: var(--font-weight-bold);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.2s ease;
  }

  .about-list a:hover {
    color: var(--color-bg-primary-active);
  }

  .about-list li {
    line-height: 1.5;
  }
</style>
