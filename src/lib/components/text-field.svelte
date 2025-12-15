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

	let isFocused = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onInput?.(target.value);
	}
</script>

<div class="field" class:focused={isFocused} class:has-value={value}>
	<label class="label" for={label.toLowerCase().replace(/\s+/g, '-')}>
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<div class="input-wrapper">
		<input
			id={label.toLowerCase().replace(/\s+/g, '-')}
			class="input"
			{type}
			{placeholder}
			{required}
			{value}
			oninput={handleInput}
			onfocus={() => isFocused = true}
			onblur={() => isFocused = false}
		/>
		<div class="focus-line"></div>
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: color 0.2s ease;
	}

	.field.focused .label {
		color: var(--color-accent);
	}

	.required {
		color: var(--color-accent);
		margin-left: var(--space-1);
	}

	.input-wrapper {
		position: relative;
	}

	.input {
		width: 100%;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		transition: 
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.2s ease;
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
		background-color: var(--color-surface-elevated);
	}

	/* Animated focus line */
	.focus-line {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 0;
		height: 2px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--color-accent),
			transparent
		);
		border-radius: 1px;
		transition: width 0.3s var(--transition-smooth), left 0.3s var(--transition-smooth);
		pointer-events: none;
	}

	.field.focused .focus-line {
		width: 100%;
		left: 0;
	}
</style>
