<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>CoverCraft — Professional Cover Letters, Instantly</title>
</svelte:head>

{@render children()}
