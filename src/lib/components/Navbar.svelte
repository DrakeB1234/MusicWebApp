<script>
  import { browser } from "$app/env";
  import { onNavigate } from "$app/navigation";
  import Icon from "./Icons/Icon.svelte";
  import Button from "./UI/Button.svelte";

  let mobileMenuOpen = $state(false);

  let isDarkMode = $state(
    browser ? document.documentElement.classList.contains("dark") : false,
  );

  function handleToggleLightMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  onNavigate(() => {
    mobileMenuOpen = false;
  });
</script>

<div class="desktop-header flex-row">
  <a href="/" class="link flex-row">
    <img
      src="/icon-192x192.webp"
      alt="Tone Tools Logo"
      width="24"
      height="24"
    />
    <h1 class="text-heading-2">Tone Tools</h1>
  </a>

  <div class="desktop-header__links flex-row">
    <a href="/exercises" class="link">Exercises</a>
    <a href="/tools" class="link">Tools</a>
    <a href="/about" class="link">About</a>
    <a href="/" class="link">Settings</a>
  </div>

  <div class="desktop-header__links flex-row">
    <Button variant="text" class="link" onclick={handleToggleLightMode}
      ><Icon icon={isDarkMode ? "lightMode" : "darkMode"} /></Button
    >
  </div>
</div>

<div class="mobile-header flex-row">
  <a href="/" class="link">
    <img
      src="/icon-192x192.webp"
      alt="Tone Tools Logo"
      width="32"
      height="32"
    />
  </a>
  <div class="mobile-header__menu">
    <Button variant="text" size="icon-base" onclick={toggleMobileMenu}>
      <Icon icon="menu" />
    </Button>
  </div>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="backdrop"
  class:hide={!mobileMenuOpen}
  onclick={toggleMobileMenu}
></div>
<aside class="mobile-sidebar" class:hide={!mobileMenuOpen}>
  <div class="mobile-sidebar__top flex-row">
    <a href="/" class="link flex-row">
      <img
        src="/icon-192x192.webp"
        alt="Tone Tools Logo"
        width="32"
        height="32"
      />
      <h1 class="text-heading-2">Tone Tools</h1>
    </a>

    <Button variant="text" size="icon-base" onclick={toggleMobileMenu}>
      <Icon icon="close" />
    </Button>
  </div>

  <hr class="space-above-sm" />

  <div class="mobile-sidebar__links flex-col lay-gap-xsm">
    <a href="/exercises" class="link link--sidebar">
      <Icon icon="ear" />
      <p>Exercises</p>
    </a>
    <a href="/tools" class="link link--sidebar">
      <Icon icon="dictionary" />
      <p>Tools</p>
    </a>
  </div>

  <hr class="space-above-base" />

  <div class="mobile-sidebar__links flex-col">
    <a href="/about" class="link link--sidebar">
      <Icon icon="about" />
      <p>About</p>
    </a>
    <a href="/" class="link link--sidebar">
      <Icon icon="settings" />
      <p>Settings</p>
    </a>
  </div>
</aside>

<style>
  .desktop-header {
    display: none;
    position: sticky;
    top: 0;
    z-index: 97;
    padding-inline: var(--space-8);

    background-color: var(--color-bg-surface-1);
    border-bottom: 1px solid var(--color-border-subtle);
    box-shadow: var(--shadow-1);
  }

  .desktop-header__links::before {
    content: "";
    background-color: var(--color-border-subtle);
    width: 1px;
    height: calc(48px + var(--space-8));
  }

  .desktop-header__links:last-child {
    margin-left: auto;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    justify-content: space-between;
    padding: var(--space-4);
    z-index: 97;

    background-color: var(--color-bg-surface-1);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-1);
  }

  .link {
    display: flex;
    align-items: center;

    width: fit-content;
    min-height: 48px;
    padding: 0 var(--space-12);
    border-radius: var(--radius-base);

    transition: var(--transition-color);
  }

  .link:hover {
    background-color: var(--color-bg-surface-1-active);
  }

  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 98;

    background-color: rgba(0, 0, 0, 0.4);
  }

  .backdrop.hide {
    display: none;
  }

  .mobile-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
    overflow-y: auto;

    width: clamp(300px, 20dvw, 500px);
    padding: var(--space-4);

    background-color: var(--color-bg-surface-1);
    border-right: 1px solid var(--color-border);
    box-shadow: var(--shadow-2);
  }

  .mobile-sidebar.hide {
    display: none;
  }

  .mobile-sidebar__top {
    justify-content: space-between;
  }

  .mobile-sidebar__links {
    margin-top: var(--space-24);
  }

  .link--sidebar {
    display: flex;
    align-items: center;
    gap: var(--space-8);

    width: 100%;
  }

  @media (min-width: 900px) {
    .mobile-header {
      display: none;
    }
    .desktop-header {
      display: flex;
    }
  }
</style>
