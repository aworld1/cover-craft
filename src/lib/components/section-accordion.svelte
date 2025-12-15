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
		<div class="header-content">
			<div class="title-line"></div>
			<span class="accordion-title">{title}</span>
			<div class="title-line flex-grow"></div>
		</div>
		<div class="chevron-wrapper">
			<svg 
				width="12" 
				height="12" 
				viewBox="0 0 12 12" 
				fill="none" 
				class="chevron"
			>
				<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
	</button>

	<div class="accordion-body" class:collapsed={!isOpen}>
		<div class="accordion-content">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.accordion {
		margin-bottom: var(--space-2);
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
		transition: color 0.2s ease;
	}

	.accordion-header:hover {
		color: var(--color-text-primary);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
	}

	.title-line {
		height: 1px;
		width: 12px;
		background-color: var(--color-border);
		transition: background-color 0.2s ease;
	}

	.title-line.flex-grow {
		flex: 1;
	}

	.accordion.open .title-line {
		background-color: var(--color-accent);
		opacity: 0.5;
	}

	.accordion-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		letter-spacing: 0.01em;
		transition: color 0.2s ease;
		white-space: nowrap;
	}

	.accordion.open .accordion-title {
		color: var(--color-text-primary);
	}

	.chevron-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		transition: background-color 0.2s ease;
	}

	.accordion-header:hover .chevron-wrapper {
		background-color: var(--color-surface-elevated);
	}

	.chevron {
		color: var(--color-text-muted);
		transition: transform 0.3s var(--transition-bounce), color 0.2s ease;
	}

	.accordion.open .chevron {
		transform: rotate(180deg);
		color: var(--color-accent);
	}

	.accordion-body {
		display: grid;
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.3s var(--transition-smooth), opacity 0.2s ease;
		opacity: 1;
	}

	.accordion-body.collapsed {
		grid-template-rows: 0fr;
		opacity: 0;
	}

	.accordion-content {
		overflow: hidden;
		padding-bottom: var(--space-4);
	}

	.accordion-body.collapsed .accordion-content {
		padding-bottom: 0;
	}
</style>
