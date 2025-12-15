<script lang="ts">
	interface Props {
		label: string;
		value: string;
		placeholder?: string;
		rows?: number;
		required?: boolean;
		onInput?: (value: string) => void;
	}

	let {
		label,
		value = $bindable(),
		placeholder = '',
		rows = 12,
		required = false,
		onInput
	}: Props = $props();

	let isFocused = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onInput?.(target.value);
	}
</script>

<div class="field" class:focused={isFocused}>
	<label class="label" for={label.toLowerCase().replace(/\s+/g, '-')}>
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<div class="textarea-wrapper">
		<textarea
			id={label.toLowerCase().replace(/\s+/g, '-')}
			class="textarea"
			{placeholder}
			{rows}
			{required}
			{value}
			oninput={handleInput}
			onfocus={() => isFocused = true}
			onblur={() => isFocused = false}
		></textarea>
		<div class="focus-border"></div>
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

	.textarea-wrapper {
		position: relative;
	}

	.textarea {
		width: 100%;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		resize: vertical;
		min-height: 200px;
		line-height: var(--leading-relaxed);
		transition: 
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.2s ease;
	}

	.textarea::placeholder {
		color: var(--color-text-muted);
	}

	.textarea:hover {
		border-color: var(--color-text-muted);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
		background-color: var(--color-surface-elevated);
	}

	/* Animated corner accent */
	.focus-border {
		position: absolute;
		top: -1px;
		left: -1px;
		width: 24px;
		height: 24px;
		border-top: 2px solid var(--color-accent);
		border-left: 2px solid var(--color-accent);
		border-radius: var(--radius-md) 0 0 0;
		opacity: 0;
		transform: scale(0.8);
		transition: opacity 0.2s ease, transform 0.2s var(--transition-bounce);
		pointer-events: none;
	}

	.field.focused .focus-border {
		opacity: 1;
		transform: scale(1);
	}
</style>
