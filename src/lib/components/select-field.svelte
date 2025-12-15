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
	let isFocused = $state(false);

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

<div class="field" class:focused={isFocused}>
	<label class="label" for={label.toLowerCase().replace(/\s+/g, '-')}>
		{label}
	</label>
	
	<div class="input-group">
		<div class="select-wrapper">
			<select
				id={label.toLowerCase().replace(/\s+/g, '-')}
				class="select"
				value={isCustom ? '__custom__' : value}
				onchange={handleSelect}
				onfocus={() => isFocused = true}
				onblur={() => isFocused = false}
			>
				{#each options as option}
					<option value={option}>{option}</option>
				{/each}
				{#if allowCustom}
					<option value="__custom__">Custom...</option>
				{/if}
			</select>
			<div class="select-arrow">
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
		</div>

		{#if isCustom}
			<input
				type="text"
				class="input"
				placeholder="Enter custom sign-off"
				value={customValue}
				oninput={handleCustomInput}
				onfocus={() => isFocused = true}
				onblur={() => isFocused = false}
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

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.select-wrapper {
		position: relative;
	}

	.select,
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

	.select {
		cursor: pointer;
		appearance: none;
		padding-right: 40px;
	}

	.select-arrow {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.field.focused .select-arrow {
		color: var(--color-accent);
	}

	.select option {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		padding: var(--space-2);
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
		background-color: var(--color-surface-elevated);
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}
</style>
