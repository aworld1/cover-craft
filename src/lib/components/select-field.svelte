<script lang="ts">
	interface Props {
		label: string;
		value: string;
		options: string[];
		allowCustom?: boolean;
		onInput?: (value: string) => void;
	}

	let {
		label,
		value = $bindable(),
		options,
		allowCustom = true,
		onInput
	}: Props = $props();

	let isCustom = $state(!options.includes(value) && value !== '');
	let customValue = $state(isCustom ? value : '');

	function handleSelect(e: Event) {
		const target = e.target as HTMLSelectElement;
		if (target.value === '__custom__') {
			isCustom = true;
			value = customValue;
		} else {
			isCustom = false;
			value = target.value;
			onInput?.(target.value);
		}
	}

	function handleCustomInput(e: Event) {
		const target = e.target as HTMLInputElement;
		customValue = target.value;
		value = target.value;
		onInput?.(target.value);
	}
</script>

<div class="field">
	<label class="label" for={label.toLowerCase().replace(/\s+/g, '-')}>
		{label}
	</label>
	
	<div class="input-group">
		<select
			id={label.toLowerCase().replace(/\s+/g, '-')}
			class="select"
			value={isCustom ? '__custom__' : value}
			onchange={handleSelect}
		>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
			{#if allowCustom}
				<option value="__custom__">Custom...</option>
			{/if}
		</select>

		{#if isCustom}
			<input
				type="text"
				class="input"
				placeholder="Enter custom sign-off"
				value={customValue}
				oninput={handleCustomInput}
			/>
		{/if}
	</div>
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

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.select,
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

	.select {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 36px;
	}

	.select option {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
	}

	.select:hover,
	.input:hover {
		border-color: var(--color-text-muted);
	}

	.select:focus,
	.input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}
</style>

