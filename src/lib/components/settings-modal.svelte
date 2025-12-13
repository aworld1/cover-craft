<script lang="ts">
	import { browser } from '$app/environment';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { extractTextFromPDF } from '$lib/pdf-extractor';
	import Button from './button.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let activeTab = $state<'profile' | 'api' | 'data'>('profile');
	let isUploading = $state(false);
	let error = $state('');

	// API keys state
	let openaiKey = $state('');
	let geminiKey = $state('');

	// Load API keys on mount
	$effect(() => {
		if (browser && open) {
			openaiKey = localStorage.getItem('covercraft-openai-key') || '';
			geminiKey = localStorage.getItem('covercraft-gemini-key') || '';
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	async function handleResumeUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isUploading = true;
		error = '';

		try {
			const text = await extractTextFromPDF(file);
			profileStore.setResume(text, file.name);
		} catch (err) {
			error = 'Failed to read PDF. Please try a different file.';
			console.error('Resume upload error:', err);
		} finally {
			isUploading = false;
		}
	}

	function handleProfileChange(field: 'senderName' | 'senderEmail' | 'senderPhone' | 'senderAddress', value: string) {
		profileStore.updateProfile({ [field]: value });
	}

	function handleOpenAIKeyChange(e: Event) {
		const target = e.target as HTMLInputElement;
		openaiKey = target.value;
		localStorage.setItem('covercraft-openai-key', openaiKey);
	}

	function handleGeminiKeyChange(e: Event) {
		const target = e.target as HTMLInputElement;
		geminiKey = target.value;
		localStorage.setItem('covercraft-gemini-key', geminiKey);
	}

	function handleClearAllData() {
		if (confirm('This will delete all your letters, profile, and settings. Are you sure?')) {
			localStorage.clear();
			window.location.reload();
		}
	}

	function handleClearResume() {
		profileStore.clearResume();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
		<div class="modal">
			<div class="modal-header">
				<h2 class="modal-title">Settings</h2>
				<button class="close-btn" onclick={onClose}>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</div>

			<div class="tabs">
				<button 
					class="tab" 
					class:active={activeTab === 'profile'}
					onclick={() => activeTab = 'profile'}
				>
					Profile
				</button>
				<button 
					class="tab" 
					class:active={activeTab === 'api'}
					onclick={() => activeTab = 'api'}
				>
					API Keys
				</button>
				<button 
					class="tab" 
					class:active={activeTab === 'data'}
					onclick={() => activeTab = 'data'}
				>
					Data
				</button>
			</div>

			<div class="modal-content">
				{#if activeTab === 'profile'}
					<div class="section">
						<h3 class="section-title">Default Sender Info</h3>
						<p class="section-desc">This info auto-fills when you create new letters.</p>
						
						<div class="field-grid">
							<div class="field">
								<label class="label" for="settings-name">Full Name</label>
								<input
									id="settings-name"
									type="text"
									class="input"
									placeholder="Your name"
									value={profileStore.profile.senderName}
									oninput={(e) => handleProfileChange('senderName', (e.target as HTMLInputElement).value)}
								/>
							</div>
							<div class="field">
								<label class="label" for="settings-email">Email</label>
								<input
									id="settings-email"
									type="email"
									class="input"
									placeholder="you@example.com"
									value={profileStore.profile.senderEmail}
									oninput={(e) => handleProfileChange('senderEmail', (e.target as HTMLInputElement).value)}
								/>
							</div>
							<div class="field">
								<label class="label" for="settings-phone">Phone</label>
								<input
									id="settings-phone"
									type="tel"
									class="input"
									placeholder="+1 555..."
									value={profileStore.profile.senderPhone}
									oninput={(e) => handleProfileChange('senderPhone', (e.target as HTMLInputElement).value)}
								/>
							</div>
							<div class="field">
								<label class="label" for="settings-location">Location</label>
								<input
									id="settings-location"
									type="text"
									class="input"
									placeholder="City, State"
									value={profileStore.profile.senderAddress}
									oninput={(e) => handleProfileChange('senderAddress', (e.target as HTMLInputElement).value)}
								/>
							</div>
						</div>
					</div>

					<div class="section">
						<h3 class="section-title">Resume</h3>
						<p class="section-desc">Used for AI cover letter generation.</p>
						
						{#if profileStore.hasResume}
							<div class="resume-saved">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span class="resume-name">{profileStore.profile.resumeFileName}</span>
								<button class="resume-clear" onclick={handleClearResume}>Remove</button>
							</div>
						{:else}
							<div class="file-upload">
								<input
									type="file"
									accept=".pdf"
									onchange={handleResumeUpload}
									disabled={isUploading}
								/>
								<div class="upload-content">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
									</svg>
									<span>{isUploading ? 'Uploading...' : 'Upload resume PDF'}</span>
								</div>
							</div>
						{/if}
						{#if error}
							<p class="error">{error}</p>
						{/if}
					</div>

				{:else if activeTab === 'api'}
					<div class="section">
						<h3 class="section-title">OpenAI</h3>
						<p class="section-desc">Used for GPT-4o Mini cover letter generation.</p>
						
						<div class="field">
							<label class="label" for="openai-key">API Key</label>
							<input
								id="openai-key"
								type="password"
								class="input"
								placeholder="sk-..."
								value={openaiKey}
								oninput={handleOpenAIKeyChange}
							/>
							<p class="hint">Get your key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></p>
						</div>
					</div>

					<div class="section">
						<h3 class="section-title">Google Gemini</h3>
						<p class="section-desc">Alternative AI provider for cover letter generation.</p>
						
						<div class="field">
							<label class="label" for="gemini-key">API Key</label>
							<input
								id="gemini-key"
								type="password"
								class="input"
								placeholder="AIza..."
								value={geminiKey}
								oninput={handleGeminiKeyChange}
							/>
							<p class="hint">Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a></p>
						</div>
					</div>

				{:else if activeTab === 'data'}
					<div class="section">
						<h3 class="section-title">Storage</h3>
						<p class="section-desc">All data is stored locally in your browser.</p>
						
						<div class="stats-row">
							<div class="stat">
								<span class="stat-value">{lettersStore.letters.length}</span>
								<span class="stat-label">Letters saved</span>
							</div>
							<div class="stat">
								<span class="stat-value">{profileStore.hasResume ? '1' : '0'}</span>
								<span class="stat-label">Resume uploaded</span>
							</div>
						</div>
					</div>

					<div class="section danger">
						<h3 class="section-title">Danger Zone</h3>
						<p class="section-desc">This action cannot be undone.</p>
						
						<Button variant="secondary" onclick={handleClearAllData}>
							Clear All Data
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fade-in 0.15s ease;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		width: 100%;
		max-width: 480px;
		max-height: 85vh;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		animation: slide-up 0.2s ease;
	}

	@keyframes slide-up {
		from { 
			opacity: 0;
			transform: translateY(10px);
		}
		to { 
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface-elevated);
	}

	.tabs {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--color-border);
	}

	.tab {
		padding: var(--space-2) var(--space-3);
		background: none;
		border: none;
		border-radius: 6px;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface-elevated);
	}

	.tab.active {
		color: var(--color-accent);
		background-color: var(--color-accent-muted);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-5);
	}

	.section {
		margin-bottom: var(--space-6);
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section.danger {
		padding: var(--space-4);
		background-color: rgba(248, 113, 113, 0.05);
		border: 1px solid rgba(248, 113, 113, 0.2);
		border-radius: 8px;
	}

	.section-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-1) 0;
	}

	.section-desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4) 0;
	}

	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.input {
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		transition: border-color var(--transition-fast);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: var(--space-1) 0 0 0;
	}

	.hint a {
		color: var(--color-accent);
		text-decoration: none;
	}

	.hint a:hover {
		text-decoration: underline;
	}

	.file-upload {
		position: relative;
		border: 2px dashed var(--color-border);
		border-radius: 8px;
		padding: var(--space-6);
		text-align: center;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.file-upload:hover {
		border-color: var(--color-accent);
		background-color: var(--color-accent-muted);
	}

	.file-upload input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.upload-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.resume-saved {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background-color: rgba(74, 222, 128, 0.1);
		border: 1px solid rgba(74, 222, 128, 0.3);
		border-radius: 6px;
		color: #4ade80;
	}

	.resume-name {
		flex: 1;
		font-size: var(--text-sm);
	}

	.resume-clear {
		padding: var(--space-1) var(--space-2);
		background: none;
		border: 1px solid currentColor;
		border-radius: 4px;
		font-size: var(--text-xs);
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.resume-clear:hover {
		opacity: 1;
	}

	.error {
		font-size: var(--text-sm);
		color: #f87171;
		margin: var(--space-2) 0 0 0;
	}

	.stats-row {
		display: flex;
		gap: var(--space-6);
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>

