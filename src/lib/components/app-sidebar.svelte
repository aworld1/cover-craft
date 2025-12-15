<script lang="ts">
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { statusColors } from '$lib/types';

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
	<div class="accent-line"></div>
	
	<div class="sidebar-content">
		<!-- Header -->
		<header class="header">
			<div class="brand">
				<span class="brand-icon">✦</span>
				<span class="brand-name">CoverCraft</span>
			</div>
		</header>

		<!-- New Letter Button -->
		<button class="new-btn" onclick={handleNewLetter}>
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
			<span>New Letter</span>
		</button>

		<!-- Letters List -->
		<nav class="letters">
			<div class="letters-header">
				<span class="letters-label">Letters</span>
				<span class="letters-count">{lettersStore.letters.length}</span>
			</div>
			
			<ul class="letters-list">
				{#each lettersStore.sortedLetters as letter (letter.id)}
					<li>
						<button 
							class="letter-item"
							class:active={letter.id === lettersStore.currentId}
							onclick={() => handleSelect(letter.id)}
						>
							<span 
								class="dot" 
								style="background-color: {statusColors[letter.status]}"
							></span>
							
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
								<div class="letter-info">
									<span class="letter-name">{letter.name}</span>
									<span class="letter-date">{formatDate(letter.updatedAt)}</span>
								</div>
								
								<div class="letter-actions">
									<button 
										class="action-btn" 
										title="Rename"
										onclick={(e) => startRename(letter.id, letter.name, e)}
									>
										<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
											<path d="M8.5 1.5l2 2M1 11l.5-2L9 1.5l2 2L3.5 11l-2 .5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</button>
									<button 
										class="action-btn" 
										title="Duplicate"
										onclick={(e) => handleDuplicate(letter.id, e)}
									>
										<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
											<rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/>
											<path d="M8.5 3.5V2.5a1 1 0 00-1-1h-5a1 1 0 00-1 1v5a1 1 0 001 1h1" stroke="currentColor" stroke-width="1.3"/>
										</svg>
									</button>
									<button 
										class="action-btn delete" 
										title="Delete"
										onclick={(e) => handleDelete(letter.id, e)}
									>
										<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
											<path d="M2.5 3h7M4.5 3V2.5a1 1 0 011-1h1a1 1 0 011 1V3M5 5.5v3M7 5.5v3M3.5 3l.5 6.5a1 1 0 001 1h2a1 1 0 001-1L8.5 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</button>
								</div>
							{/if}
						</button>
					</li>
				{:else}
					<li class="empty">
						<span>No letters yet</span>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Footer -->
		<footer class="footer">
			<a href="/tracker" class="footer-btn">
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
					<path d="M1.5 6h13" stroke="currentColor" stroke-width="1.5"/>
					<path d="M5 9.5h3M5 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
				<span>Tracker</span>
			</a>
			<button class="footer-btn" onclick={onOpenSettings}>
				<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
					<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
				<span>Settings</span>
			</button>
		</footer>
	</div>
</aside>

<style>
	.sidebar {
		position: relative;
		width: 256px;
		height: 100%;
		background-color: var(--color-bg);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-shrink: 0;
	}

	.accent-line {
		position: absolute;
		left: 0;
		top: 0;
		width: 2px;
		height: 120px;
		background: linear-gradient(180deg, var(--color-accent) 0%, transparent 100%);
		opacity: 0.7;
	}

	.sidebar-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* Header */
	.header {
		padding: 20px 16px;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.brand-icon {
		color: var(--color-accent);
		font-size: 16px;
	}

	.brand-name {
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	/* New Button */
	.new-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 16px;
		padding: 10px 16px;
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
		border: none;
		border-radius: 8px;
		color: var(--color-accent-contrast);
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px var(--color-accent-glow);
	}

	.new-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px var(--color-accent-glow);
	}

	.new-btn:active {
		transform: translateY(0);
	}

	/* Letters Section */
	.letters {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 0 8px;
	}

	.letters-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 8px 8px;
	}

	.letters-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.letters-count {
		font-size: 10px;
		font-weight: 500;
		color: var(--color-text-muted);
		background-color: var(--color-surface-elevated);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.letters-list {
		flex: 1;
		overflow-y: auto;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.letters-list li {
		margin-bottom: 2px;
	}

	/* Letter Item */
	.letter-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		background: none;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.15s ease;
		position: relative;
	}

	.letter-item:hover {
		background-color: var(--color-surface);
	}

	.letter-item.active {
		background-color: var(--color-accent-muted);
	}

	.letter-item.active::after {
		content: '';
		position: absolute;
		left: 0;
		top: 8px;
		bottom: 8px;
		width: 2px;
		background-color: var(--color-accent);
		border-radius: 1px;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.letter-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.letter-name {
		font-size: 13px;
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

	/* Actions - positioned absolutely to avoid layout shift */
	.letter-actions {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 2px;
		padding: 2px;
		background-color: var(--color-surface-elevated);
		border-radius: 5px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}

	.letter-item:hover .letter-actions {
		opacity: 1;
		pointer-events: auto;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		background: none;
		border: none;
		border-radius: 4px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.action-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface-overlay);
	}

	.action-btn.delete:hover {
		color: var(--color-error);
		background-color: rgba(232, 92, 74, 0.12);
	}

	.rename-input {
		flex: 1;
		padding: 4px 8px;
		font-size: 13px;
		font-weight: 500;
		background-color: var(--color-surface);
		border: 1px solid var(--color-accent);
		border-radius: 4px;
		color: var(--color-text-primary);
		outline: none;
	}

	.empty {
		padding: 24px 8px;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 13px;
	}

	/* Footer */
	.footer {
		padding: 12px;
		border-top: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.footer-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		background: none;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		color: var(--color-text-secondary);
		text-decoration: none;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		text-align: left;
	}

	.footer-btn:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface);
	}

	.footer-btn svg {
		flex-shrink: 0;
	}
</style>
