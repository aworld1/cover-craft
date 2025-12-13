<script lang="ts">
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { statusColors, type LetterStatus } from '$lib/types';

	interface Props {
		onOpenSettings: () => void;
	}

	let { onOpenSettings }: Props = $props();

	let editingId = $state<string | null>(null);
	let editingName = $state('');

	function handleNewLetter() {
		lettersStore.createLetter(profileStore.profile);
	}

	function handleSelect(id: string) {
		if (editingId) return;
		lettersStore.selectLetter(id);
	}

	function startRename(id: string, currentName: string, e: Event) {
		e.stopPropagation();
		editingId = id;
		editingName = currentName;
	}

	function saveRename() {
		if (editingId && editingName.trim()) {
			lettersStore.renameLetter(editingId, editingName.trim());
		}
		editingId = null;
		editingName = '';
	}

	function handleRenameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveRename();
		} else if (e.key === 'Escape') {
			editingId = null;
			editingName = '';
		}
	}

	function handleDuplicate(id: string, e: Event) {
		e.stopPropagation();
		lettersStore.duplicateLetter(id);
	}

	function handleDelete(id: string, e: Event) {
		e.stopPropagation();
		if (confirm('Delete this letter?')) {
			lettersStore.deleteLetter(id);
		}
	}

	function formatDate(isoString: string): string {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays}d ago`;
		
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<span class="brand">CoverCraft</span>
	</div>

	<button class="new-letter-btn" onclick={handleNewLetter}>
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
			<path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
		</svg>
		New Letter
	</button>

	<div class="letters-section">
		<span class="section-label">Letters</span>
		
		<ul class="letter-list">
			{#each lettersStore.sortedLetters as letter (letter.id)}
				<li 
					class="letter-item"
					class:active={letter.id === lettersStore.currentId}
					onclick={() => handleSelect(letter.id)}
					role="button"
					tabindex="0"
				>
					<span 
						class="status-dot" 
						style="background-color: {statusColors[letter.status]}"
						title={letter.status}
					></span>
					
					<div class="letter-content">
						{#if editingId === letter.id}
							<input
								type="text"
								class="rename-input"
								bind:value={editingName}
								onblur={saveRename}
								onkeydown={handleRenameKeydown}
								onclick={(e) => e.stopPropagation()}
							/>
						{:else}
							<span class="letter-name">{letter.name}</span>
							<span class="letter-date">{formatDate(letter.updatedAt)}</span>
						{/if}
					</div>

					<div class="letter-actions">
						<button 
							class="action-btn" 
							title="Rename"
							onclick={(e) => startRename(letter.id, letter.name, e)}
						>
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<path d="M8.5 1.5l2 2M1 11l.5-2L9 1.5l2 2L3.5 11l-2 .5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<button 
							class="action-btn" 
							title="Duplicate"
							onclick={(e) => handleDuplicate(letter.id, e)}
						>
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.2"/>
								<path d="M8.5 3.5V2.5a1 1 0 00-1-1h-5a1 1 0 00-1 1v5a1 1 0 001 1h1" stroke="currentColor" stroke-width="1.2"/>
							</svg>
						</button>
						<button 
							class="action-btn delete" 
							title="Delete"
							onclick={(e) => handleDelete(letter.id, e)}
						>
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<path d="M2.5 3h7M4.5 3V2.5a1 1 0 011-1h1a1 1 0 011 1V3M5 5.5v3M7 5.5v3M3.5 3l.5 6.5a1 1 0 001 1h2a1 1 0 001-1L8.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</div>
				</li>
			{:else}
				<li class="empty-state">
					No letters yet
				</li>
			{/each}
		</ul>
	</div>

	<div class="sidebar-footer">
		<a href="/tracker" class="footer-link">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<rect x="1" y="2" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
				<path d="M1 5h12" stroke="currentColor" stroke-width="1.5"/>
				<path d="M4 8h2M4 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			Tracker
		</a>
		<button class="footer-link" onclick={onOpenSettings}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"/>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
			</svg>
			Settings
		</button>
	</div>
</aside>

<style>
	.sidebar {
		width: 240px;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg);
		border-right: 1px solid var(--color-border);
	}

	.sidebar-header {
		padding: var(--space-4) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.brand {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	.new-letter-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		margin: var(--space-4);
		padding: var(--space-3);
		background-color: var(--color-accent);
		border: none;
		border-radius: 6px;
		color: #0a0a0a;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.new-letter-btn:hover {
		background-color: var(--color-accent-hover);
	}

	.letters-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 0 var(--space-2);
	}

	.section-label {
		padding: var(--space-2) var(--space-2);
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.letter-list {
		flex: 1;
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
	}

	.letter-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2);
		border-radius: 6px;
		cursor: pointer;
		transition: background-color var(--transition-fast);
		position: relative;
	}

	.letter-item:hover {
		background-color: var(--color-surface);
	}

	.letter-item.active {
		background-color: var(--color-accent-muted);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.letter-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.letter-name {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.letter-date {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.rename-input {
		width: 100%;
		padding: 2px 4px;
		margin: -2px -4px;
		font-size: var(--text-sm);
		font-weight: 500;
		background-color: var(--color-surface);
		border: 1px solid var(--color-accent);
		border-radius: 3px;
		color: var(--color-text-primary);
	}

	.rename-input:focus {
		outline: none;
	}

	.letter-actions {
		display: none;
		gap: 2px;
	}

	.letter-item:hover .letter-actions {
		display: flex;
	}

	.letter-item:hover .letter-date {
		display: none;
	}

	.action-btn {
		padding: 4px;
		background: var(--color-surface-elevated);
		border: none;
		border-radius: 4px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.action-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-border);
	}

	.action-btn.delete:hover {
		color: #f87171;
		background-color: rgba(248, 113, 113, 0.15);
	}

	.empty-state {
		padding: var(--space-4) var(--space-2);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.sidebar-footer {
		padding: var(--space-3);
		border-top: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.footer-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2);
		border-radius: 6px;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		width: 100%;
		text-align: left;
	}

	.footer-link:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface);
	}
</style>

