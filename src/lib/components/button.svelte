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
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-sans);
		font-weight: 500;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s var(--transition-smooth);
		white-space: nowrap;
		overflow: hidden;
	}

	.button::before {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: none !important;
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

	/* Primary Variant — Gradient with glow */
	.primary {
		background: linear-gradient(
			135deg,
			var(--color-accent) 0%,
			var(--color-accent-hover) 100%
		);
		color: var(--color-accent-contrast);
		box-shadow: var(--shadow-sm), 0 0 0 0 var(--color-accent-glow);
	}

	.primary::before {
		background: linear-gradient(
			135deg,
			var(--color-accent-hover) 0%,
			var(--color-accent) 100%
		);
	}

	.primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md), var(--shadow-glow);
	}

	.primary:hover:not(:disabled)::before {
		opacity: 1;
	}

	.primary:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
		box-shadow: var(--shadow-sm);
	}

	/* Secondary Variant */
	.secondary {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.secondary:hover:not(:disabled) {
		background-color: var(--color-surface-overlay);
		border-color: var(--color-text-muted);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.secondary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	/* Ghost Variant */
	.ghost {
		background-color: transparent;
		color: var(--color-text-secondary);
	}

	.ghost:hover:not(:disabled) {
		background-color: var(--color-accent-muted);
		color: var(--color-accent);
	}

	.ghost:active:not(:disabled) {
		background-color: var(--color-accent-muted);
	}
</style>
