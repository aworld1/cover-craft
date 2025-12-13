<script lang="ts">
	import { onMount } from 'svelte';
	import TextField from '$lib/components/text-field.svelte';
	import TextArea from '$lib/components/text-area.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import Button from '$lib/components/button.svelte';
	import LetterPreview from '$lib/components/letter-preview.svelte';
	import AiGenerator from '$lib/components/ai-generator.svelte';
	import { defaultLetterData, signOffOptions, type LetterData } from '$lib/types';
	import { generatePDF } from '$lib/pdf-generator';

	// State
	let letterData = $state<LetterData>({ ...defaultLetterData });
	let isGenerating = $state(false);
	let showMobilePreview = $state(false);

	// LocalStorage persistence
	const STORAGE_KEY = 'covercraft-draft';

	onMount(() => {
		// Load saved draft
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				letterData = { ...defaultLetterData, ...parsed };
			} catch {
				// Invalid JSON, ignore
			}
		}
	});

	// Save to localStorage on changes (debounced effect)
	let saveTimeout: ReturnType<typeof setTimeout>;
	$effect(() => {
		// Track all properties
		const _ = JSON.stringify(letterData);
		
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(letterData));
		}, 500);
	});

	async function handleDownload() {
		isGenerating = true;
		try {
			// Small delay to show loading state
			await new Promise((r) => setTimeout(r, 100));
			generatePDF(letterData);
		} finally {
			isGenerating = false;
		}
	}

	function handleClear() {
		letterData = { ...defaultLetterData };
		localStorage.removeItem(STORAGE_KEY);
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
				<Button variant="ghost" size="sm" onclick={handleClear}>
					Clear
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
			<div class="panel-scroll">
				<!-- Your Info Section -->
				<div class="section">
					<h2 class="section-title">Your Information</h2>
					<div class="field-grid">
						<TextField
							label="Full Name"
							bind:value={letterData.senderName}
							placeholder="Jane Smith"
						/>
						<TextField
							label="Email"
							type="email"
							bind:value={letterData.senderEmail}
							placeholder="jane@example.com"
						/>
						<TextField
							label="Phone"
							type="tel"
							bind:value={letterData.senderPhone}
							placeholder="+1 (555) 123-4567"
						/>
						<TextField
							label="Address"
							bind:value={letterData.senderAddress}
							placeholder="San Francisco, CA"
						/>
					</div>
				</div>

				<!-- Recipient Section -->
				<div class="section">
					<h2 class="section-title">Recipient</h2>
					<div class="field-grid">
						<TextField
							label="Recipient Name"
							bind:value={letterData.recipientName}
							placeholder="John Doe"
						/>
						<TextField
							label="Title"
							bind:value={letterData.recipientTitle}
							placeholder="Hiring Manager"
						/>
						<TextField
							label="Company"
							bind:value={letterData.companyName}
							placeholder="Acme Corporation"
						/>
						<TextField
							label="Company Address"
							bind:value={letterData.companyAddress}
							placeholder="New York, NY"
						/>
					</div>
				</div>

				<!-- Date, Salutation & Sign-off Section -->
				<div class="section">
					<h2 class="section-title">Letter Details</h2>
					<div class="field-grid">
						<TextField
							label="Date"
							bind:value={letterData.date}
						/>
						<TextField
							label="Salutation"
							bind:value={letterData.salutation}
							placeholder="Dear Hiring Manager"
						/>
						<SelectField
							label="Sign-off"
							bind:value={letterData.signOff}
							options={signOffOptions}
						/>
					</div>
				</div>

				<!-- AI Generator -->
				<div class="section">
					<AiGenerator onGenerated={(content) => (letterData.body = content)} />
				</div>

				<!-- Body Section -->
				<div class="section">
					<TextArea
						label="Letter Body"
						bind:value={letterData.body}
						placeholder="I am writing to express my strong interest in the [Position] role at [Company].

In my current role at [Current Company], I have [key achievement or responsibility]. This experience has equipped me with [relevant skills].

I am particularly drawn to [Company] because [specific reason]. I believe my background in [relevant experience] would allow me to contribute meaningfully to your team.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application."
						rows={16}
					/>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="panel-footer">
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
		</section>

		<!-- Preview Panel -->
		<section class="panel preview-panel" class:hidden-mobile={!showMobilePreview}>
			<LetterPreview data={letterData} />
		</section>
	</main>
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
		gap: var(--space-2);
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

	.panel-footer :global(button) {
		width: 100%;
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
