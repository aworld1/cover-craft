<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		onclick,
		children
	}: Props = $props();
</script>

<button
	class="button {variant} {size}"
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-sans);
		font-weight: 500;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.sm {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xs);
	}

	.md {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-sm);
	}

	.lg {
		padding: var(--space-4) var(--space-6);
		font-size: var(--text-base);
	}

	/* Variants */
	.primary {
		background-color: var(--color-accent);
		color: var(--color-accent-contrast);
	}

	.primary:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
	}

	.primary:active:not(:disabled) {
		transform: scale(0.98);
	}

	.secondary {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.secondary:hover:not(:disabled) {
		background-color: var(--color-border);
	}

	.ghost {
		background-color: transparent;
		color: var(--color-text-secondary);
	}

	.ghost:hover:not(:disabled) {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
	}
</style>

