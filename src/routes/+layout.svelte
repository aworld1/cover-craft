<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem('covercraft-theme');
			const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			document.documentElement.setAttribute('data-theme', theme);
		}
	});
</script>

<svelte:head>
	<title>CoverCraft — Professional Cover Letters, Instantly</title>
</svelte:head>

{@render children()}
