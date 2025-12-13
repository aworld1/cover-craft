<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		defaultOpen?: boolean;
		children: Snippet;
	}

	let { title, defaultOpen = true, children }: Props = $props();

	let isOpen = $state(defaultOpen);
</script>

<div class="accordion" class:open={isOpen}>
	<button 
		class="accordion-header"
		onclick={() => isOpen = !isOpen}
		aria-expanded={isOpen}
	>
		<span class="accordion-title">{title}</span>
		<svg 
			width="12" 
			height="12" 
			viewBox="0 0 12 12" 
			fill="none" 
			class="chevron"
		>
			<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>

	{#if isOpen}
		<div class="accordion-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.accordion {
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.accordion:last-child {
		border-bottom: none;
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) 0;
		background: none;
		border: none;
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.accordion-header:hover {
		color: var(--color-text-primary);
	}

	.accordion-title {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.accordion.open .accordion-title {
		color: var(--color-text-primary);
	}

	.chevron {
		color: var(--color-text-muted);
		transition: transform var(--transition-fast);
	}

	.accordion.open .chevron {
		transform: rotate(180deg);
	}

	.accordion-content {
		padding-bottom: var(--space-4);
	}
</style>

