<script lang="ts">
	import "../app.css";
	import { dev } from "$app/environment";
	import { RenderScan } from "svelte-render-scan";
	import Navbar from "$lib/components/Navbar.svelte";
	import { onMount } from "svelte";
	import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
	import { sfxAudioService } from "$lib/audio/sfxAudioService.svelte";
	import { midiService } from "$lib/midiservice/midiService.svelte";

	let { children } = $props();

	onMount(() => {
		pianoAudioService.init();
		sfxAudioService.init();
		midiService.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="/icon-192x192.webp" />
	<title>Tone Tools</title>
</svelte:head>

{#if dev}
	<RenderScan />
{/if}

<Navbar />
{@render children()}
