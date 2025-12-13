<script lang="ts">
	interface Props {
		label: string;
		value: string;
		placeholder?: string;
		type?: 'text' | 'email' | 'tel';
		required?: boolean;
		onInput?: (value: string) => void;
	}

	let {
		label,
		value = $bindable(),
		placeholder = '',
		type = 'text',
		required = false,
		onInput
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onInput?.(target.value);
	}
</script>

<div class="field">
	<label class="label" for={label.toLowerCase().replace(/\s+/g, '-')}>
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<input
		id={label.toLowerCase().replace(/\s+/g, '-')}
		class="input"
		{type}
		{placeholder}
		{required}
		{value}
		oninput={handleInput}
	/>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.required {
		color: var(--color-accent);
		margin-left: var(--space-1);
	}

	.input {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:hover {
		border-color: var(--color-text-muted);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}
</style>

