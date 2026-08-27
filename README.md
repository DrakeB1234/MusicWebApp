![ToneTools Icon](static/pwa-icon-192x192.png)

# Tone Tools

A comprehensive, interactive web application designed for daily music theory practice and a one stop place for many useful tools.

## Features
* **Chord Progression Tool:** Create chord progressions then play them back in one of many pre-programmed music styles.
* **Interval Ear Training:** Custom made or preset interval ear training exercises and a system to track your stats.
* **Interactive Sight Reading:** Generates dynamic sheet music with customizable clefs, note ranges, and accidental toggles.
* **Web MIDI Integration:** Connect physical hardware keyboards to interact with exercises in real-time, featuring custom debouncing for chord detection.
* **Chord & Scale Libraries:** Look up useful information regarding chords and scales.

## Tech Stack
* **Framework:** SvelteKit 5 / Svelte Runes
* **Language:** TypeScript
* **Styling:** Custom SCSS with a responsive, CSS-variable-driven design system.

## Technical Highlights
* **Unified Audio & MIDI Services:** Uses reactive Svelte 5 classes (`$state`) to seamlessly bridge browser Web Audio/MIDI APIs directly into UI components with unified setup/teardown lifecycles.
* **Chord Progression Lookahead Scheduler:** Fully custom made just-in-time (JIT) scheduler for notes in my chord progression tool. Based off a common paradigm used in digital audio workstations (DAW) for most efficient browser based note player.
* **Sheet Music Rendering:** Powered by [`vector-score`](https://github.com/DrakeB1234/VectorScore), a custom open-source TypeScript notation engine I built specifically for this ecosystem.

## Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open `localhost:5173` in your browser.
