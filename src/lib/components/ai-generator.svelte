<script lang="ts">
	import { extractTextFromPDF } from '$lib/pdf-extractor';
	import Button from './button.svelte';

	interface Props {
		onGenerated: (content: string) => void;
	}

	let { onGenerated }: Props = $props();

	type Provider = 'openai' | 'gemini';
	type GeminiModel = 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-2.5-flash';

	let isExpanded = $state(false);
	let provider = $state<Provider>('openai');
	let geminiModel = $state<GeminiModel>('gemini-2.5-flash');
	let apiKey = $state('');
	let jobDescription = $state('');
	let resumeFile = $state<File | null>(null);
	let resumeText = $state('');
	let isLoading = $state(false);
	let error = $state('');

	// Load settings from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const savedProvider = localStorage.getItem('covercraft-provider') as Provider | null;
			if (savedProvider) provider = savedProvider;
			
			const savedModel = localStorage.getItem('covercraft-gemini-model') as GeminiModel | null;
			if (savedModel) geminiModel = savedModel;
			
			const savedKey = localStorage.getItem(`covercraft-${provider}-key`);
			if (savedKey) apiKey = savedKey;
		}
	});

	// Load API key when provider changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			const savedKey = localStorage.getItem(`covercraft-${provider}-key`);
			apiKey = savedKey || '';
		}
	});

	function handleProviderChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		provider = target.value as Provider;
		if (typeof window !== 'undefined') {
			localStorage.setItem('covercraft-provider', provider);
		}
	}

	function handleGeminiModelChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		geminiModel = target.value as GeminiModel;
		if (typeof window !== 'undefined') {
			localStorage.setItem('covercraft-gemini-model', geminiModel);
		}
	}

	function handleApiKeyChange(e: Event) {
		const target = e.target as HTMLInputElement;
		apiKey = target.value;
		if (typeof window !== 'undefined') {
			localStorage.setItem(`covercraft-${provider}-key`, apiKey);
		}
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		resumeFile = file;
		error = '';

		try {
			resumeText = await extractTextFromPDF(file);
		} catch (err) {
			console.error('PDF extraction error:', err);
			error = `Failed to read PDF: ${err instanceof Error ? err.message : 'Unknown error'}`;
			resumeFile = null;
			resumeText = '';
		}
	}

	async function handleGenerate() {
		if (!apiKey || !resumeText || !jobDescription) return;

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apiKey,
					resumeText,
					jobDescription,
					provider,
					geminiModel: provider === 'gemini' ? geminiModel : undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate');
			}

			onGenerated(data.content);
			isExpanded = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate cover letter';
		} finally {
			isLoading = false;
		}
	}

	const canGenerate = $derived(apiKey && resumeText && jobDescription.trim());
	
	const providerLabel = $derived(provider === 'openai' ? 'OpenAI' : 'Google Gemini');
	const keyPlaceholder = $derived(provider === 'openai' ? 'sk-...' : 'AIza...');
	const keyHint = $derived(
		provider === 'openai' 
			? 'Get your key at platform.openai.com' 
			: 'Get your key at aistudio.google.com'
	);
</script>

<div class="ai-generator">
	<button
		class="toggle-button"
		onclick={() => (isExpanded = !isExpanded)}
		aria-expanded={isExpanded}
	>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="icon">
			<path d="M8 1v6M8 9v6M1 8h6M9 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
		</svg>
		<span>Generate with AI</span>
		<svg 
			width="12" 
			height="12" 
			viewBox="0 0 12 12" 
			fill="none" 
			class="chevron"
			class:expanded={isExpanded}
		>
			<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>

	{#if isExpanded}
		<div class="panel">
			<!-- Provider Selection -->
			<div class="field">
				<label class="label" for="provider">AI Provider</label>
				<select
					id="provider"
					class="select"
					value={provider}
					onchange={handleProviderChange}
				>
					<option value="openai">OpenAI (GPT-4o Mini)</option>
					<option value="gemini">Google Gemini</option>
				</select>
			</div>

			<!-- Gemini Model Selection -->
			{#if provider === 'gemini'}
				<div class="field">
					<label class="label" for="gemini-model">Gemini Model</label>
					<select
						id="gemini-model"
						class="select"
						value={geminiModel}
						onchange={handleGeminiModelChange}
					>
						<option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</option>
						<option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
						<option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
					</select>
				</div>
			{/if}

			<!-- API Key -->
			<div class="field">
				<label class="label" for="api-key">{providerLabel} API Key</label>
				<input
					id="api-key"
					type="password"
					class="input"
					placeholder={keyPlaceholder}
					value={apiKey}
					oninput={handleApiKeyChange}
				/>
				<p class="hint">{keyHint}</p>
			</div>

			<!-- Resume Upload -->
			<div class="field">
				<label class="label" for="resume">Resume PDF</label>
				<div class="file-input">
					<input
						id="resume"
						type="file"
						accept=".pdf"
						onchange={handleFileSelect}
					/>
					{#if resumeFile}
						<span class="file-name">{resumeFile.name}</span>
					{:else}
						<span class="file-placeholder">Choose PDF file...</span>
					{/if}
				</div>
			</div>

			<!-- Job Description -->
			<div class="field">
				<label class="label" for="job-desc">Job Description</label>
				<textarea
					id="job-desc"
					class="textarea"
					placeholder="Paste the job description here..."
					rows={6}
					bind:value={jobDescription}
				></textarea>
			</div>

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<Button
				variant="primary"
				onclick={handleGenerate}
				disabled={!canGenerate || isLoading}
			>
				{#if isLoading}
					<svg class="spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
						<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="7" />
					</svg>
					Generating...
				{:else}
					Generate Cover Letter
				{/if}
			</Button>
		</div>
	{/if}
</div>

<style>
	.ai-generator {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		background-color: var(--color-surface-elevated);
	}

	.toggle-button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: none;
		border: none;
		color: var(--color-accent);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.toggle-button:hover {
		background-color: var(--color-accent-muted);
	}

	.icon {
		color: var(--color-accent);
	}

	.chevron {
		margin-left: auto;
		transition: transform var(--transition-fast);
	}

	.chevron.expanded {
		transform: rotate(180deg);
	}

	.panel {
		padding: var(--space-4);
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

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

	.input,
	.textarea,
	.select {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		transition: border-color var(--transition-fast);
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

	.input:focus,
	.textarea:focus,
	.select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.textarea {
		resize: vertical;
		min-height: 100px;
		line-height: 1.5;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.file-input {
		position: relative;
	}

	.file-input input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.file-name,
	.file-placeholder {
		display: block;
		background-color: var(--color-surface);
		border: 1px dashed var(--color-border);
		border-radius: 6px;
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		text-align: center;
	}

	.file-name {
		color: var(--color-text-primary);
		border-style: solid;
		border-color: var(--color-accent);
	}

	.file-placeholder {
		color: var(--color-text-muted);
	}

	.error {
		color: #ef4444;
		font-size: var(--text-sm);
		margin: 0;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
