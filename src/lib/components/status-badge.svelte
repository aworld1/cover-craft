<script lang="ts">
	import { statusLabels, statusColors, type LetterStatus } from '$lib/types';

	interface Props {
		status: LetterStatus;
		size?: 'sm' | 'md';
	}

	let { status, size = 'sm' }: Props = $props();
</script>

<span 
	class="badge {size}"
	style="--status-color: {statusColors[status]}"
>
	{statusLabels[status]}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-sans);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--status-color);
		background-color: color-mix(in srgb, var(--status-color) 12%, transparent);
		border-radius: var(--radius-sm);
		white-space: nowrap;
		transition: all 0.2s ease;
	}

	.badge::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--status-color);
		animation: pulse 2s ease-in-out infinite;
	}

	.sm {
		font-size: 9px;
		padding: 3px 8px;
	}

	.md {
		font-size: 10px;
		padding: 4px 10px;
	}
</style>
