<script lang="ts">
	import { profileStore } from '$lib/stores/profile.svelte';
	import { extractTextFromPDF } from '$lib/pdf-extractor';
	import Button from './button.svelte';

	let isExpanded = $state(false);
	let isUploading = $state(false);
	let error = $state('');

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

	function handleFieldChange(field: 'senderName' | 'senderEmail' | 'senderPhone' | 'senderAddress', value: string) {
		profileStore.updateProfile({ [field]: value });
	}

	function handleClearResume() {
		profileStore.clearResume();
	}
</script>

<div class="profile-panel">
	<button
		class="panel-header"
		onclick={() => (isExpanded = !isExpanded)}
		aria-expanded={isExpanded}
	>
		<span class="header-title">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<circle cx="7" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
				<path d="M2 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			My Profile
			{#if profileStore.hasResume || profileStore.hasSenderInfo}
				<span class="saved-indicator">Saved</span>
			{/if}
		</span>
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
		<div class="panel-content">
			<p class="description">
				Save your info once and auto-fill new letters.
			</p>

			<!-- Resume Upload -->
			<div class="field">
				<label class="label">Resume (for AI generation)</label>
				{#if profileStore.hasResume}
					<div class="resume-saved">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M2 8l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span class="resume-name">{profileStore.profile.resumeFileName}</span>
						<button class="clear-btn" onclick={handleClearResume}>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
								<path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						</button>
					</div>
				{:else}
					<div class="file-upload">
						<input
							type="file"
							accept=".pdf"
							onchange={handleResumeUpload}
							disabled={isUploading}
						/>
						<span class="upload-text">
							{#if isUploading}
								Uploading...
							{:else}
								Upload resume PDF
							{/if}
						</span>
					</div>
				{/if}
				{#if error}
					<p class="error">{error}</p>
				{/if}
			</div>

			<!-- Sender Defaults -->
			<div class="field">
				<label class="label" for="profile-name">Default Name</label>
				<input
					id="profile-name"
					type="text"
					class="input"
					placeholder="Your full name"
					value={profileStore.profile.senderName}
					oninput={(e) => handleFieldChange('senderName', (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="field">
				<label class="label" for="profile-email">Default Email</label>
				<input
					id="profile-email"
					type="email"
					class="input"
					placeholder="your@email.com"
					value={profileStore.profile.senderEmail}
					oninput={(e) => handleFieldChange('senderEmail', (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="field-row">
				<div class="field">
					<label class="label" for="profile-phone">Phone</label>
					<input
						id="profile-phone"
						type="tel"
						class="input"
						placeholder="+1 555..."
						value={profileStore.profile.senderPhone}
						oninput={(e) => handleFieldChange('senderPhone', (e.target as HTMLInputElement).value)}
					/>
				</div>
				<div class="field">
					<label class="label" for="profile-address">Location</label>
					<input
						id="profile-address"
						type="text"
						class="input"
						placeholder="City, State"
						value={profileStore.profile.senderAddress}
						oninput={(e) => handleFieldChange('senderAddress', (e.target as HTMLInputElement).value)}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-panel {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.panel-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.panel-header:hover {
		color: var(--color-text-primary);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.saved-indicator {
		background-color: rgba(74, 222, 128, 0.2);
		color: #4ade80;
		padding: 1px 6px;
		border-radius: 10px;
		font-size: 9px;
	}

	.chevron {
		transition: transform var(--transition-fast);
	}

	.chevron.expanded {
		transform: rotate(180deg);
	}

	.panel-content {
		padding: 0 var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.description {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.label {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input {
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 4px;
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

	.file-upload {
		position: relative;
		border: 1px dashed var(--color-border);
		border-radius: 4px;
		padding: var(--space-3);
		text-align: center;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.file-upload:hover {
		border-color: var(--color-accent);
	}

	.file-upload input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.upload-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.resume-saved {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background-color: rgba(74, 222, 128, 0.1);
		border: 1px solid rgba(74, 222, 128, 0.3);
		border-radius: 4px;
		color: #4ade80;
	}

	.resume-name {
		flex: 1;
		font-size: var(--text-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.clear-btn {
		padding: 4px;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-radius: 4px;
		transition: all var(--transition-fast);
	}

	.clear-btn:hover {
		color: #f87171;
		background-color: rgba(248, 113, 113, 0.1);
	}

	.error {
		font-size: var(--text-xs);
		color: #f87171;
		margin: 0;
	}
</style>

