<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TextField from '$lib/components/text-field.svelte';
	import TextArea from '$lib/components/text-area.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import Button from '$lib/components/button.svelte';
	import LetterPreview from '$lib/components/letter-preview.svelte';
	import LetterSidebar from '$lib/components/letter-sidebar.svelte';
	import ProfilePanel from '$lib/components/profile-panel.svelte';
	import StatusBadge from '$lib/components/status-badge.svelte';
	import AiGenerator from '$lib/components/ai-generator.svelte';
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { defaultLetterData, signOffOptions, statusLabels, type LetterStatus, type LetterData } from '$lib/types';
	import { generatePDF, type PDFTemplate } from '$lib/pdf-generator';

	// State
	let isGenerating = $state(false);
	let showMobilePreview = $state(false);
	let isDark = $state(true);
	let showCopyToast = $state(false);

	// Get current letter data, or default if none
	const letterData = $derived(lettersStore.current?.data || defaultLetterData);
	const currentLetter = $derived(lettersStore.current);

	onMount(() => {
		// Migrate from old single-draft format
		lettersStore.migrateFromLegacy();
		
		// Create first letter if none exist
		if (lettersStore.letters.length === 0) {
			lettersStore.createLetter(profileStore.profile);
		}

		// Load theme state
		isDark = document.documentElement.getAttribute('data-theme') !== 'light';

		// Keyboard shortcuts
		function handleKeydown(e: KeyboardEvent) {
			const isMod = e.metaKey || e.ctrlKey;
			
			if (isMod && e.key === 'd') {
				e.preventDefault();
				if (letterData.body.trim()) handleDownload();
			}
			if (isMod && e.key === 'n') {
				e.preventDefault();
				handleNewLetter();
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// Save changes to current letter (debounced)
	let saveTimeout: ReturnType<typeof setTimeout>;
	function handleDataChange(field: keyof LetterData, value: string) {
		if (!currentLetter) return;
		
		const newData = { ...letterData, [field]: value };
		
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			lettersStore.updateCurrentData(newData);
		}, 500);
	}

	async function handleDownload() {
		isGenerating = true;
		try {
			await new Promise((r) => setTimeout(r, 100));
			const template = currentLetter?.template || 'classic';
			generatePDF(letterData, template);
			// Mark as sent if still draft
			if (currentLetter && currentLetter.status === 'draft') {
				lettersStore.setStatus(currentLetter.id, 'sent');
			}
		} finally {
			isGenerating = false;
		}
	}

	function handleTemplateChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		if (currentLetter) {
			lettersStore.setTemplate(currentLetter.id, target.value as PDFTemplate);
		}
	}

	function handleStatusChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		if (currentLetter) {
			lettersStore.setStatus(currentLetter.id, target.value as LetterStatus);
		}
	}

	function handleNewLetter() {
		lettersStore.createLetter(profileStore.profile);
	}

	function handleCopyAsText() {
		const text = formatLetterAsText();
		navigator.clipboard.writeText(text);
		showCopyToast = true;
		setTimeout(() => showCopyToast = false, 2000);
	}

	function formatLetterAsText(): string {
		const parts: string[] = [];
		
		if (letterData.senderName) parts.push(letterData.senderName);
		const contact = [letterData.senderEmail, letterData.senderPhone].filter(Boolean).join(' | ');
		if (contact) parts.push(contact);
		if (letterData.senderAddress) parts.push(letterData.senderAddress);
		
		parts.push('');
		parts.push(letterData.date);
		parts.push('');
		
		if (letterData.recipientName) parts.push(letterData.recipientName);
		if (letterData.recipientTitle) parts.push(letterData.recipientTitle);
		if (letterData.companyName) parts.push(letterData.companyName);
		if (letterData.companyAddress) parts.push(letterData.companyAddress);
		
		parts.push('');
		parts.push(`${letterData.salutation},`);
		parts.push('');
		parts.push(letterData.body);
		parts.push('');
		parts.push(`${letterData.signOff},`);
		parts.push(letterData.senderName);
		
		return parts.join('\n');
	}

	function toggleTheme() {
		isDark = !isDark;
		const theme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('covercraft-theme', theme);
	}
</script>

<div class="app">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div class="logo">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M4 4h16v16H4V4z" stroke="currentColor" stroke-width="1.5" fill="none"/>
					<path d="M4 8h16" stroke="currentColor" stroke-width="1.5"/>
					<path d="M8 8v12" stroke="currentColor" stroke-width="1.5"/>
				</svg>
				<span class="logo-text">CoverCraft</span>
			</div>
			<div class="header-actions">
				<a href="/tracker" class="tracker-link">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					Tracker
				</a>
				<button class="icon-btn" onclick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
					{#if isDark}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
							<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M14 9.5A6.5 6.5 0 016.5 2c0-.5.05-1 .15-1.5A7 7 0 108 15c.5 0 1-.05 1.5-.15A6.5 6.5 0 0114 9.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</button>
				<Button variant="ghost" size="sm" onclick={handleNewLetter}>
					New
				</Button>
				<Button variant="ghost" size="sm" onclick={() => (showMobilePreview = !showMobilePreview)}>
					{showMobilePreview ? 'Edit' : 'Preview'}
				</Button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main">
		<!-- Input Panel -->
		<section class="panel input-panel" class:hidden-mobile={showMobilePreview}>
			<!-- Profile Panel -->
			<ProfilePanel />
			
			<!-- Letter Sidebar -->
			<LetterSidebar />

			<div class="panel-scroll">
				<!-- Letter Header with Status -->
				{#if currentLetter}
					<div class="letter-header">
						<h1 class="letter-title">{currentLetter.name}</h1>
						<select 
							class="status-select"
							value={currentLetter.status}
							onchange={handleStatusChange}
						>
							{#each Object.entries(statusLabels) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Your Info Section -->
				<div class="section">
					<h2 class="section-title">Your Information</h2>
					<div class="field-grid">
						<TextField
							label="Full Name"
							value={letterData.senderName}
							placeholder="Jane Smith"
							onInput={(v) => handleDataChange('senderName', v)}
						/>
						<TextField
							label="Email"
							type="email"
							value={letterData.senderEmail}
							placeholder="jane@example.com"
							onInput={(v) => handleDataChange('senderEmail', v)}
						/>
						<TextField
							label="Phone"
							type="tel"
							value={letterData.senderPhone}
							placeholder="+1 (555) 123-4567"
							onInput={(v) => handleDataChange('senderPhone', v)}
						/>
						<TextField
							label="Address"
							value={letterData.senderAddress}
							placeholder="San Francisco, CA"
							onInput={(v) => handleDataChange('senderAddress', v)}
						/>
					</div>
				</div>

				<!-- Recipient Section -->
				<div class="section">
					<h2 class="section-title">Recipient</h2>
					<div class="field-grid">
						<TextField
							label="Recipient Name"
							value={letterData.recipientName}
							placeholder="John Doe"
							onInput={(v) => handleDataChange('recipientName', v)}
						/>
						<TextField
							label="Title"
							value={letterData.recipientTitle}
							placeholder="Hiring Manager"
							onInput={(v) => handleDataChange('recipientTitle', v)}
						/>
						<TextField
							label="Company"
							value={letterData.companyName}
							placeholder="Acme Corporation"
							onInput={(v) => handleDataChange('companyName', v)}
						/>
						<TextField
							label="Company Address"
							value={letterData.companyAddress}
							placeholder="New York, NY"
							onInput={(v) => handleDataChange('companyAddress', v)}
						/>
					</div>
				</div>

				<!-- Date, Salutation & Sign-off Section -->
				<div class="section">
					<h2 class="section-title">Letter Details</h2>
					<div class="field-grid">
						<TextField
							label="Date"
							value={letterData.date}
							onInput={(v) => handleDataChange('date', v)}
						/>
						<TextField
							label="Salutation"
							value={letterData.salutation}
							placeholder="Dear Hiring Manager"
							onInput={(v) => handleDataChange('salutation', v)}
						/>
						<SelectField
							label="Sign-off"
							value={letterData.signOff}
							options={signOffOptions}
							onInput={(v) => handleDataChange('signOff', v)}
						/>
					</div>
				</div>

				<!-- AI Generator -->
				<div class="section">
					<AiGenerator onGenerated={(content) => handleDataChange('body', content)} />
				</div>

				<!-- Body Section -->
				<div class="section">
					<TextArea
						label="Letter Body"
						value={letterData.body}
						placeholder="I am writing to express my strong interest in the [Position] role at [Company].

In my current role at [Current Company], I have [key achievement or responsibility]. This experience has equipped me with [relevant skills].

I am particularly drawn to [Company] because [specific reason]. I believe my background in [relevant experience] would allow me to contribute meaningfully to your team.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application."
						rows={16}
						onInput={(v) => handleDataChange('body', v)}
					/>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="panel-footer">
				<div class="footer-row">
					<select 
						class="template-select"
						value={currentLetter?.template || 'classic'}
						onchange={handleTemplateChange}
					>
						<option value="classic">Classic</option>
						<option value="modern">Modern</option>
						<option value="bold">Bold</option>
					</select>
					<button 
						class="copy-btn"
						onclick={handleCopyAsText}
						disabled={!letterData.body.trim()}
						title="Copy as plain text"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
							<path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" stroke="currentColor" stroke-width="1.5"/>
						</svg>
					</button>
					<Button
						variant="primary"
						size="lg"
						onclick={handleDownload}
						disabled={isGenerating || !letterData.body.trim()}
					>
					{#if isGenerating}
						<svg class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="32" stroke-dashoffset="8" />
						</svg>
						Generating...
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M8 2v8M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M2 12v2h12v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						Download PDF
					{/if}
				</Button>
				</div>
			</div>
		</section>

		<!-- Preview Panel -->
		<section class="panel preview-panel" class:hidden-mobile={!showMobilePreview}>
			<LetterPreview data={letterData} />
		</section>
	</main>

	<!-- Copy Toast -->
	{#if showCopyToast}
		<div class="toast">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path d="M2 7l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			Copied to clipboard
		</div>
	{/if}
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	/* Header */
	.header {
		flex-shrink: 0;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		max-width: 1800px;
		margin: 0 auto;
		width: 100%;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text-primary);
	}

	.logo-text {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.tracker-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: 6px;
		transition: all var(--transition-fast);
	}

	.tracker-link:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface-elevated);
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.icon-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
	}

	.header-actions :global(button:last-child) {
		display: none;
	}

	/* Main Content */
	.main {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: hidden;
	}

	/* Panels */
	.panel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.input-panel {
		border-right: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.panel-scroll {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
	}

	.preview-panel {
		background-color: var(--color-bg);
	}

	/* Letter Header */
	.letter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.letter-title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-select {
		padding: var(--space-1) var(--space-3);
		padding-right: 28px;
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-secondary);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'%3E%3Cpath d='M2.5 4L5 6.5L7.5 4' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;
	}

	.status-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	/* Sections */
	.section {
		margin-bottom: var(--space-8);
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
	}

	/* Panel Footer */
	.panel-footer {
		flex-shrink: 0;
		padding: var(--space-4) var(--space-6);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.footer-row {
		display: flex;
		gap: var(--space-3);
	}

	.template-select {
		padding: var(--space-3) var(--space-4);
		padding-right: 36px;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-primary);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
	}

	.template-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.footer-row :global(button:last-of-type) {
		flex: 1;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.copy-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
	}

	.copy-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Toast */
	.toast {
		position: fixed;
		bottom: var(--space-6);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: #4ade80;
		font-size: var(--text-sm);
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		animation: toast-in 0.2s ease;
		z-index: 1000;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Spinner Animation */
	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.main {
			grid-template-columns: 1fr;
		}

		.header-actions :global(button:last-child) {
			display: inline-flex;
		}

		.hidden-mobile {
			display: none;
		}

		.field-grid {
			grid-template-columns: 1fr;
		}

		.tracker-link {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.header-content {
			padding: var(--space-3) var(--space-4);
		}

		.panel-scroll {
			padding: var(--space-4);
		}

		.panel-footer {
			padding: var(--space-3) var(--space-4);
		}
	}
</style>
