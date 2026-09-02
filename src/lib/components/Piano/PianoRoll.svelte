<script lang="ts">
  import { convertNoteNameToMidi } from "$lib/helpers/musicTheory";
  import {
    keysConfig as _keysConfig,
    getActiveMidiNums,
    getViewBoxWidth,
    generateKeys,
    viewBoxHeight as defaultViewBoxHeight,
  } from "./pianoHelpers";

  type Props = {
    activeNotes?: string[];
    range?: { startNote: string; endNote: string };
    interactive?: boolean;
    onNoteClick?: (midi: number) => void;
    labelMode?: "all" | "root" | "none";
    keyHeight?: { white?: number; black?: number };
    fit?: boolean;
    overflowScroll?: boolean;
  };

  let {
    activeNotes = [],
    range = {
      startNote: "C4",
      endNote: "E6",
    },
    interactive = false,
    onNoteClick,
    labelMode = "all",
    keyHeight,
    fit = false,
    overflowScroll: showRuler = false,
  }: Props = $props();

  let keysConfig = $derived({
    ..._keysConfig,
    white: {
      ..._keysConfig.white,
      height: keyHeight?.white ?? _keysConfig.white.height,
    },
    black: {
      ..._keysConfig.black,
      height: keyHeight?.black ?? _keysConfig.black.height,
    },
  });

  let startMidiNum = $derived(convertNoteNameToMidi(range.startNote) ?? 60);
  let endMidiNum = $derived(convertNoteNameToMidi(range.endNote) ?? 84);

  let keys = $derived(generateKeys(startMidiNum, endMidiNum));

  let whiteKeys = $derived(keys.filter((k) => k.type === "white"));
  let blackKeys = $derived(keys.filter((k) => k.type === "black"));

  let viewBoxWidth = $derived(getViewBoxWidth(whiteKeys.length));
  let viewBoxPadding = defaultViewBoxHeight - _keysConfig.white.height;
  let viewBoxHeight = $derived(keysConfig.white.height + viewBoxPadding);

  let activeMidis = $derived(getActiveMidiNums(activeNotes));

  function handleSvgInteraction(e: MouseEvent | KeyboardEvent) {
    if (!interactive) return;
    const target = e.target as Element;
    const keyElement = target.closest("[data-midinum]");
    if (keyElement) {
      const midiString = keyElement.getAttribute("data-midinum");
      if (midiString) onNoteClick?.(Number(midiString));
    }
  }

  function showLabel(noteName: string) {
    if (labelMode === "all") return true;
    if (labelMode === "root") return noteName === "C";
    return false;
  }
</script>

{#snippet svgContent()}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <svg
    class="piano-svg"
    class:fit
    class:non-interactive={!interactive}
    role="img"
    aria-label="Piano Roll"
    viewBox="0 0 {viewBoxWidth} {viewBoxHeight}"
    onclick={handleSvgInteraction}
  >
    <g class="keys-layer">
      {#each whiteKeys as key (key.midi)}
        {@const isActive = activeMidis.has(key.midi)}
        <g class="key-group">
          <rect
            class="key white"
            class:interactive
            class:active={isActive}
            x={key.x}
            y="0"
            width={keysConfig.white.width}
            height={keysConfig.white.height}
            rx={keysConfig.white.radius}
            data-midinum={key.midi}
          />
          {#if showLabel(key.noteName)}
            <text
              class="note-text white"
              x={key.x + keysConfig.white.width / 2}
              y={keysConfig.white.height - 12}
            >
              {labelMode === "root" ? `C${(key.midi - 12) / 12}` : key.noteName}
            </text>
          {/if}
        </g>
      {/each}
    </g>
    <g class="keys-layer">
      {#each blackKeys as key (key.midi)}
        {@const isActive = activeMidis.has(key.midi)}
        <g class="key-group">
          <rect
            class="key black"
            class:interactive
            class:active={isActive}
            x={key.x}
            y="-2"
            width={keysConfig.black.width}
            height={keysConfig.black.height}
            rx={keysConfig.black.radius}
            data-midinum={key.midi}
          />
          {#if labelMode === "all"}
            <text
              class="note-text black"
              x={key.x + keysConfig.black.width / 2}
              y={26}
            >
              {key.enharmonicNoteName}
            </text>
            <text
              class="note-text black"
              x={key.x + keysConfig.black.width / 2}
              y={42}
            >
              {key.noteName}
            </text>
          {/if}
        </g>
      {/each}
    </g>
  </svg>
{/snippet}

{#if showRuler}
  <div class="scroll-wrapper">
    <div class="piano-content-wrapper">
      <div class="control-track">
        <div class="dummy-ruler-line"></div>
      </div>
      {@render svgContent()}
    </div>
  </div>
{:else}
  {@render svgContent()}
{/if}

<style>
  .piano-svg {
    height: 11em;
    max-width: unset;

    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .key.white {
    fill: rgb(252, 252, 252);
    stroke: rgb(219, 220, 226);
  }

  .key.white.interactive:hover:not(.active) {
    fill: rgb(233, 234, 241);
  }

  .key.black {
    fill: rgb(29, 32, 41);
  }

  .key.black.interactive:hover:not(.active) {
    fill: rgb(58, 61, 75);
  }

  .note-text {
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-base);
    pointer-events: none;
    text-anchor: middle;
  }

  .note-text.white {
    fill: black;
  }

  .note-text.black {
    fill: white;
  }

  /* TEMP WORKAROUND translateX to see active border over the inactive keys */
  .key.active {
    fill: var(--color-bg-primary);
    stroke: var(--color-bg-primary-dark);

    transform: translatex(-1px);
  }

  .key.active ~ text {
    fill: white;
  }

  .piano-svg.fit {
    height: auto;
    max-width: 100%;
  }

  .piano-svg.non-interactive {
    cursor: default;
    pointer-events: none;
  }

  .scroll-wrapper {
    width: 100%;
    overflow-x: auto;
    scrollbar-color: var(--color-border) var(--color-bg-secondary);
  }

  .piano-content-wrapper {
    display: inline-flex;
    flex-direction: column;
  }

  .control-track {
    width: 100%;
    height: 2em;
    position: relative;
    background-color: var(--color-bg-secondary);
  }

  .dummy-ruler-line {
    width: 100%;
    height: 50%;
    border-bottom: 1px dashed var(--color-border);
  }
</style>
