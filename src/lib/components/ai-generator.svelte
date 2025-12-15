<script lang="ts">
	import { extractTextFromPDF } from '$lib/pdf-extractor';
	import { profileStore } from '$lib/stores/profile.svelte';
	import Button from './button.svelte';

	interface Props {
		onGenerated: (content: string) => void;
	}

	let { onGenerated }: Props = $props();

	type Provider = 'openai' | 'gemini';
	type GeminiModel = 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-2.5-flash';
	type Tone = 'professional' | 'conversational' | 'confident';

	let isExpanded = $state(false);
	let provider = $state<Provider>('openai');
	let geminiModel = $state<GeminiModel>('gemini-2.5-flash');
	let tone = $state<Tone>('professional');
	let apiKey = $state('');
	let jobDescription = $state('');
	let resumeFile = $state<File | null>(null);
	let resumeText = $state('');
	let useProfileResume = $state(true);
	let isLoading = $state(false);
	let error = $state('');

	// Use profile resume if available and user wants to
	const effectiveResumeText = $derived(
		useProfileResume && profileStore.hasResume 
			? profileStore.profile.resumeText 
			: resumeText
	);
	
	const hasResume = $derived(
		(useProfileResume && profileStore.hasResume) || resumeText
	);

	// Load settings from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const savedProvider = localStorage.getItem('covercraft-provider') as Provider | null;
			if (savedProvider) provider = savedProvider;
			
			const savedModel = localStorage.getItem('covercraft-gemini-model') as GeminiModel | null;
			if (savedModel) geminiModel = savedModel;

			const savedTone = localStorage.getItem('covercraft-tone') as Tone | null;
			if (savedTone) tone = savedTone;
			
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

	function handleToneChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		tone = target.value as Tone;
		if (typeof window !== 'undefined') {
			localStorage.setItem('covercraft-tone', tone);
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
		if (!apiKey || !effectiveResumeText || !jobDescription) return;

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apiKey,
					resumeText: effectiveResumeText,
					jobDescription,
					provider,
					geminiModel: provider === 'gemini' ? geminiModel : undefined,
					tone
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

	const canGenerate = $derived(apiKey && hasResume && jobDescription.trim());
	
	const providerLabel = $derived(provider === 'openai' ? 'OpenAI' : 'Google Gemini');
	const keyPlaceholder = $derived(provider === 'openai' ? 'sk-...' : 'AIza...');
	const keyHint = $derived(
		provider === 'openai' 
			? 'Get your key at platform.openai.com' 
			: 'Get your key at aistudio.google.com'
	);
</script>

<div class="ai-generator" class:expanded={isExpanded}>
	<button
		class="toggle-button"
		onclick={() => (isExpanded = !isExpanded)}
		aria-expanded={isExpanded}
	>
		<div class="toggle-icon">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M8 1v6M8 9v6M1 8h6M9 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		</div>
		<span class="toggle-text">Generate with AI</span>
		<svg 
			width="12" 
			height="12" 
			viewBox="0 0 12 12" 
			fill="none" 
			class="chevron"
		>
			<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>

	{#if isExpanded}
		<div class="panel">
			<!-- Provider Selection -->
			<div class="field">
				<label class="label" for="provider">AI Provider</label>
				<div class="select-wrapper">
					<select
						id="provider"
						class="select"
						value={provider}
						onchange={handleProviderChange}
					>
						<option value="openai">OpenAI (GPT-4o Mini)</option>
						<option value="gemini">Google Gemini</option>
					</select>
					<div class="select-arrow">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</div>
			</div>

			<!-- Gemini Model Selection -->
			{#if provider === 'gemini'}
				<div class="field">
					<label class="label" for="gemini-model">Gemini Model</label>
					<div class="select-wrapper">
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
						<div class="select-arrow">
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
				</div>
			{/if}

			<!-- Tone Selection -->
			<div class="field">
				<label class="label" for="tone">Writing Tone</label>
				<div class="select-wrapper">
					<select
						id="tone"
						class="select"
						value={tone}
						onchange={handleToneChange}
					>
						<option value="professional">Professional — Polished, formal</option>
						<option value="conversational">Conversational — Warm, personable</option>
						<option value="confident">Confident — Bold, achievement-focused</option>
					</select>
					<div class="select-arrow">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</div>
			</div>

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

			<!-- Resume Selection -->
			<div class="field">
				<label class="label">Resume</label>
				{#if profileStore.hasResume}
					<div class="resume-option">
						<label class="radio-label">
							<input
								type="radio"
								name="resume-source"
								checked={useProfileResume}
								onchange={() => { useProfileResume = true; }}
							/>
							<span class="radio-indicator"></span>
							<span>Use saved: {profileStore.profile.resumeFileName}</span>
						</label>
						<label class="radio-label">
							<input
								type="radio"
								name="resume-source"
								checked={!useProfileResume}
								onchange={() => { useProfileResume = false; }}
							/>
							<span class="radio-indicator"></span>
							<span>Upload different</span>
						</label>
					</div>
				{/if}
				{#if !profileStore.hasResume || !useProfileResume}
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
							<span class="file-placeholder">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M8 3v7M5 6l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
								Choose PDF file...
							</span>
						{/if}
					</div>
				{/if}
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
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background-color: var(--color-surface-elevated);
		transition: box-shadow 0.3s ease;
	}

	/* Gradient border effect */
	.ai-generator::before {
		content: '';
		position: absolute;
		inset: 0;
		padding: 1px;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			135deg,
			var(--color-border) 0%,
			var(--color-accent) 50%,
			var(--color-border) 100%
		);
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
		opacity: 0.5;
		transition: opacity 0.3s ease;
	}

	.ai-generator:hover::before,
	.ai-generator.expanded::before {
		opacity: 1;
	}

	.ai-generator.expanded {
		box-shadow: var(--shadow-md);
	}

	.toggle-button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: none;
		border: none;
		color: var(--color-accent);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.toggle-button:hover {
		background-color: var(--color-accent-muted);
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background-color: var(--color-accent-muted);
		border-radius: var(--radius-md);
		color: var(--color-accent);
		transition: transform 0.2s ease;
	}

	.ai-generator.expanded .toggle-icon {
		transform: rotate(45deg);
	}

	.toggle-text {
		flex: 1;
		text-align: left;
	}

	.chevron {
		color: var(--color-accent);
		transition: transform 0.3s var(--transition-bounce);
	}

	.ai-generator.expanded .chevron {
		transform: rotate(180deg);
	}

	.panel {
		padding: 0 var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		animation: fadeInUp 0.3s var(--transition-smooth);
	}

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
	}

	.input,
	.textarea,
	.select {
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
			box-shadow 0.2s ease;
	}

	.select-wrapper {
		position: relative;
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
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}

	.textarea {
		resize: vertical;
		min-height: 100px;
		line-height: var(--leading-relaxed);
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.resume-option {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		transition: background-color 0.15s ease;
	}

	.radio-label:hover {
		background-color: var(--color-surface);
	}

	.radio-label input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.radio-indicator {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-radius: 50%;
		position: relative;
		transition: border-color 0.2s ease;
	}

	.radio-label input:checked + .radio-indicator {
		border-color: var(--color-accent);
	}

	.radio-label input:checked + .radio-indicator::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background-color: var(--color-accent);
		border-radius: 50%;
	}

	.radio-label span:last-child {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background-color: var(--color-surface);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		font-size: var(--text-sm);
		text-align: center;
		transition: all 0.2s ease;
	}

	.file-input:hover .file-placeholder {
		border-color: var(--color-accent);
		background-color: var(--color-accent-muted);
	}

	.file-name {
		color: var(--color-text-primary);
		border-style: solid;
		border-color: var(--color-accent);
		background-color: var(--color-accent-muted);
	}

	.file-placeholder {
		color: var(--color-text-muted);
	}

	.error {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
		padding: var(--space-2) var(--space-3);
		background-color: rgba(232, 92, 74, 0.1);
		border-radius: var(--radius-md);
	}

	.spinner {
		animation: spin 1s linear infinite;
	}
</style>
