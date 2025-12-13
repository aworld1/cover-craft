<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TextField from '$lib/components/text-field.svelte';
	import TextArea from '$lib/components/text-area.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import Button from '$lib/components/button.svelte';
	import LetterPreview from '$lib/components/letter-preview.svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SettingsModal from '$lib/components/settings-modal.svelte';
	import SectionAccordion from '$lib/components/section-accordion.svelte';
	import AiGenerator from '$lib/components/ai-generator.svelte';
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { defaultLetterData, signOffOptions, statusLabels, type LetterStatus, type LetterData } from '$lib/types';
	import { generatePDF, type PDFTemplate } from '$lib/pdf-generator';

	// State
	let isGenerating = $state(false);
	let isDark = $state(true);
	let showCopyToast = $state(false);
	let showSettings = $state(false);
	let showPreview = $state(true);

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

		// Load preview state
		const savedPreview = localStorage.getItem('covercraft-show-preview');
		if (savedPreview !== null) {
			showPreview = savedPreview === 'true';
		}

		// Keyboard shortcuts
		function handleKeydown(e: KeyboardEvent) {
			const isMod = e.metaKey || e.ctrlKey;
			
			if (isMod && e.key === 'd') {
				e.preventDefault();
				if (letterData.body.trim()) handleDownload();
			}
			if (isMod && e.key === 'n') {
				e.preventDefault();
				lettersStore.createLetter(profileStore.profile);
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

	function togglePreview() {
		showPreview = !showPreview;
		localStorage.setItem('covercraft-show-preview', String(showPreview));
	}

	function handleTitleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (currentLetter) {
			lettersStore.renameLetter(currentLetter.id, target.value);
		}
	}
</script>

<div class="app">
	<!-- Sidebar -->
	<AppSidebar onOpenSettings={() => showSettings = true} />

	<!-- Main Area -->
	<div class="main-area">
		<!-- Header -->
		<header class="header">
			<div class="header-left">
				{#if currentLetter}
					<input
						type="text"
						class="title-input"
						value={currentLetter.name}
						onchange={handleTitleChange}
					/>
					<select 
						class="status-select"
						value={currentLetter.status}
						onchange={handleStatusChange}
					>
						{#each Object.entries(statusLabels) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				{/if}
			</div>
			<div class="header-right">
				<button class="icon-btn" onclick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
					{#if isDark}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
							<path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.3 3.3l.7.7M12 12l.7.7M3.3 12.7l.7-.7M12 4l.7-.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M13 9A5 5 0 117 3a6 6 0 006 6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</button>
			</div>
		</header>

		<!-- Content -->
		<div class="content" class:preview-hidden={!showPreview}>
			<!-- Editor Panel -->
			<section class="editor-panel">
				<div class="editor-scroll">
					<!-- Your Information -->
					<SectionAccordion title="Your Information" defaultOpen={!profileStore.hasSenderInfo}>
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
					</SectionAccordion>

					<!-- Recipient -->
					<SectionAccordion title="Recipient">
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
					</SectionAccordion>

					<!-- Letter Details -->
					<SectionAccordion title="Letter Details">
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
					</SectionAccordion>

					<!-- AI Generator -->
					<SectionAccordion title="AI Generator" defaultOpen={false}>
						<AiGenerator onGenerated={(content) => handleDataChange('body', content)} />
					</SectionAccordion>

					<!-- Body -->
					<div class="body-section">
						<TextArea
							label="Letter Body"
							value={letterData.body}
							placeholder="Write your cover letter here, or use AI to generate one..."
							rows={12}
							onInput={(v) => handleDataChange('body', v)}
						/>
					</div>
				</div>

				<!-- Footer -->
				<div class="editor-footer">
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
						class="icon-btn"
						onclick={handleCopyAsText}
						disabled={!letterData.body.trim()}
						title="Copy as text"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
							<path d="M11 5V3.5A1.5 1.5 0 009.5 2h-5A1.5 1.5 0 003 3.5v5A1.5 1.5 0 004.5 10H5" stroke="currentColor" stroke-width="1.5"/>
						</svg>
					</button>
					<Button
						variant="primary"
						onclick={handleDownload}
						disabled={isGenerating || !letterData.body.trim()}
					>
						{#if isGenerating}
							<svg class="spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
								<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="7" />
							</svg>
							Generating...
						{:else}
							Download PDF
						{/if}
					</Button>
					<button 
						class="preview-toggle"
						onclick={togglePreview}
						title={showPreview ? 'Hide preview' : 'Show preview'}
					>
						{#if showPreview}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M10 8l4-4M10 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								<rect x="2" y="3" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
							</svg>
						{:else}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M6 8l-4-4M6 8l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								<rect x="6" y="3" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
							</svg>
						{/if}
					</button>
				</div>
			</section>

			<!-- Preview Panel -->
			{#if showPreview}
				<section class="preview-panel">
					<LetterPreview data={letterData} />
				</section>
			{/if}
		</div>
	</div>

	<!-- Settings Modal -->
	<SettingsModal open={showSettings} onClose={() => showSettings = false} />

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
		height: 100vh;
		overflow: hidden;
	}

	.main-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-width: 0;
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.title-input {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		background: none;
		border: none;
		padding: var(--space-1) 0;
		min-width: 120px;
		max-width: 300px;
	}

	.title-input:focus {
		outline: none;
		border-bottom: 2px solid var(--color-accent);
	}

	.status-select {
		padding: var(--space-1) var(--space-2);
		padding-right: 24px;
		font-size: 11px;
		font-weight: 500;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-secondary);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'%3E%3Cpath d='M2.5 4L5 6.5L7.5 4' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 6px center;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
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

	.icon-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
	}

	.icon-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Content */
	.content {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 420px;
		overflow: hidden;
	}

	.content.preview-hidden {
		grid-template-columns: 1fr;
	}

	/* Editor Panel */
	.editor-panel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: var(--color-surface);
		border-right: 1px solid var(--color-border);
	}

	.content.preview-hidden .editor-panel {
		border-right: none;
	}

	.editor-scroll {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-5);
	}

	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.body-section {
		margin-top: var(--space-4);
	}

	/* Editor Footer */
	.editor-footer {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.template-select {
		padding: var(--space-2) var(--space-3);
		padding-right: 32px;
		font-size: var(--text-sm);
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-primary);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 10px center;
	}

	.editor-footer :global(button:not(.icon-btn):not(.preview-toggle)) {
		flex: 1;
	}

	.preview-toggle {
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

	.preview-toggle:hover {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
	}

	/* Preview Panel */
	.preview-panel {
		background-color: var(--color-bg);
		overflow: hidden;
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

	/* Spinner */
	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.app {
			flex-direction: column;
		}

		.app > :global(.sidebar) {
			display: none;
		}

		.content {
			grid-template-columns: 1fr;
		}

		.preview-panel {
			display: none;
		}

		.preview-toggle {
			display: none;
		}

		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
