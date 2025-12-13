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
		gap: 4px;
		font-family: var(--font-mono);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--status-color);
		background-color: color-mix(in srgb, var(--status-color) 15%, transparent);
		border-radius: 4px;
		white-space: nowrap;
	}

	.badge::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--status-color);
	}

	.sm {
		font-size: 9px;
		padding: 2px 6px;
	}

	.md {
		font-size: 10px;
		padding: 3px 8px;
	}
</style>

