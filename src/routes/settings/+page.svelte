<script lang="ts">
  import Wrapper from "$lib/components/Wrapper.svelte";
  import PageHeaderContainer from "$lib/components/PageHeaderContainer.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Slider from "$lib/components/UI/Slider.svelte";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Toggle from "$lib/components/UI/Toggle.svelte";
  import { browser } from "$app/environment";
  import { userPreferencesService } from "$lib/data/userPreferencesService.svelte";
  import { sfxAudioService } from "$lib/audio/sfxAudioService.svelte";
  import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
  import Button from "$lib/components/UI/Button.svelte";

  let isDarkMode = $state(
    browser ? document.documentElement.classList.contains("dark") : false,
  );

  function handleToggleLightMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }

  function changeVolume(
    type: "master" | "piano" | "sfx",
    target: Event & { currentTarget: HTMLInputElement },
  ) {
    const value = Number(target.currentTarget.value);

    if (type === "master") {
      userPreferencesService.setMasterVolume(value);
      Howler.volume(userPreferencesService.masterVolume / 100);
    }
    if (type === "piano") {
      userPreferencesService.setPianoVolume(value);
      pianoAudioService.changeVolume(userPreferencesService.pianoVolume);
    }
    if (type === "sfx") {
      userPreferencesService.setSfxVolume(value);
      sfxAudioService.changeVolume(userPreferencesService.sfxVolume);
    }
  }

  function resetVolume() {
    userPreferencesService.resetVolumeDefault();
    Howler.volume(userPreferencesService.masterVolume / 100);
    pianoAudioService.changeVolume(userPreferencesService.pianoVolume);
    sfxAudioService.changeVolume(userPreferencesService.sfxVolume);
  }
</script>

<svelte:head>
  <title>Settings | Tone Tools</title>
</svelte:head>

<Wrapper>
  <main>
    <PageHeaderContainer headerText="Settings" fallbackHref="/" />

    <section class="card">
      <p class="text-heading-3">Volume Settings</p>
      <div class="flex-col__input-label">
        <Label labelFor="master-volume">Master</Label>
        <div class="input__volume">
          <Icon icon="volumeMute" />
          <Slider
            id="master-volume"
            value={userPreferencesService.masterVolume}
            min={0}
            max={100}
            onchange={(e) => changeVolume("master", e)}
          />
          <Icon icon="volumeUp" />
        </div>
      </div>
      <hr class="settings__divider" />
      <div class="flex-col__input-label">
        <Label labelFor="piano-volume">Piano</Label>
        <div class="input__volume">
          <Icon icon="volumeMute" />
          <Slider
            id="piano-volume"
            value={userPreferencesService.pianoVolume}
            min={0}
            max={100}
            onchange={(e) => changeVolume("piano", e)}
          />
          <Icon icon="volumeUp" />
        </div>
      </div>
      <hr class="settings__divider" />
      <div class="flex-col__input-label">
        <Label labelFor="sound-effects-volume">Sound Effects</Label>
        <div class="input__volume">
          <Icon icon="volumeMute" />
          <Slider
            id="sound-effects-volume"
            value={userPreferencesService.sfxVolume}
            min={0}
            max={100}
            onchange={(e) => changeVolume("sfx", e)}
          />
          <Icon icon="volumeUp" />
        </div>
      </div>

      <Button variant="outlined" class="space-above-xlg" onclick={resetVolume}
        >Reset Volume</Button
      >
    </section>

    <section class="card">
      <p class="text-heading-3">App Settings</p>
      <div class="input__toggle">
        <Label labelFor="master-volume">Dark Mode</Label>
        <Toggle
          id="master-volume"
          toggled={isDarkMode}
          onchange={handleToggleLightMode}
        />
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

  p.text-heading-3 {
    margin-bottom: var(--space-16);
  }

  .settings__divider {
    margin-block: var(--space-16);
    background-color: var(--color-border-subtle);
  }

  .input__volume {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-8);

    margin-top: var(--space-8);
    max-width: 350px;
  }

  .input__toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-8);
  }
</style>
