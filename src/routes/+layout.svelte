<script lang="ts">
	import "../app.css";
	import { dev } from "$app/environment";
	import { RenderScan } from "svelte-render-scan";
	import Navbar from "$lib/components/Navbar.svelte";

	let { children } = $props();
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
