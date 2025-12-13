<script lang="ts">
	import { lettersStore } from '$lib/stores/letters.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import StatusBadge from './status-badge.svelte';
	import Button from './button.svelte';

	let isExpanded = $state(true);
	let editingId = $state<string | null>(null);
	let editingName = $state('');

	function handleNewLetter() {
		lettersStore.createLetter(profileStore.profile);
	}

	function handleSelect(id: string) {
		lettersStore.selectLetter(id);
	}

	function startRename(id: string, currentName: string) {
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

	function handleDuplicate(id: string) {
		lettersStore.duplicateLetter(id);
	}

	function handleDelete(id: string) {
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

<div class="sidebar" class:collapsed={!isExpanded}>
	<button 
		class="sidebar-header"
		onclick={() => isExpanded = !isExpanded}
		aria-expanded={isExpanded}
	>
		<span class="header-title">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path d="M2 3h10M2 7h10M2 11h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			My Letters
			<span class="count">{lettersStore.letters.length}</span>
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
		<div class="sidebar-content">
			<div class="new-letter">
				<Button variant="secondary" size="sm" onclick={handleNewLetter}>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
						<path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					New Letter
				</Button>
			</div>

			<ul class="letter-list">
				{#each lettersStore.sortedLetters as letter (letter.id)}
					<li 
						class="letter-item"
						class:active={letter.id === lettersStore.currentId}
					>
						<button 
							class="letter-button"
							onclick={() => handleSelect(letter.id)}
						>
							<div class="letter-info">
								{#if editingId === letter.id}
									<input
										type="text"
										class="rename-input"
										bind:value={editingName}
										onblur={saveRename}
										onkeydown={handleRenameKeydown}
									/>
								{:else}
									<span class="letter-name">{letter.name}</span>
								{/if}
								<span class="letter-date">{formatDate(letter.updatedAt)}</span>
							</div>
							<StatusBadge status={letter.status} />
						</button>

						<div class="letter-actions">
							<button 
								class="action-btn" 
								title="Rename"
								onclick={(e) => { e.stopPropagation(); startRename(letter.id, letter.name); }}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path d="M8.5 1.5l2 2M1 11l.5-2L9 1.5l2 2L3.5 11l-2 .5z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
							<button 
								class="action-btn" 
								title="Duplicate"
								onclick={(e) => { e.stopPropagation(); handleDuplicate(letter.id); }}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1"/>
									<path d="M9 3V2a1 1 0 00-1-1H2a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" stroke-width="1"/>
								</svg>
							</button>
							<button 
								class="action-btn delete" 
								title="Delete"
								onclick={(e) => { e.stopPropagation(); handleDelete(letter.id); }}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5l.5-7" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
						</div>
					</li>
				{:else}
					<li class="empty-state">
						No letters yet. Create your first one!
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.sidebar {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.sidebar-header {
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

	.sidebar-header:hover {
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

	.count {
		background-color: var(--color-border);
		padding: 1px 6px;
		border-radius: 10px;
		font-size: 10px;
	}

	.chevron {
		transition: transform var(--transition-fast);
	}

	.chevron.expanded {
		transform: rotate(180deg);
	}

	.sidebar-content {
		padding: 0 var(--space-4) var(--space-4);
	}

	.new-letter {
		margin-bottom: var(--space-3);
	}

	.new-letter :global(button) {
		width: 100%;
		justify-content: center;
	}

	.letter-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 200px;
		overflow-y: auto;
	}

	.letter-item {
		position: relative;
		border-radius: 6px;
		transition: background-color var(--transition-fast);
	}

	.letter-item:hover {
		background-color: var(--color-surface);
	}

	.letter-item.active {
		background-color: var(--color-accent-muted);
	}

	.letter-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.letter-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.letter-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.letter-date {
		font-size: 10px;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}

	.rename-input {
		width: 100%;
		padding: 2px 4px;
		font-size: var(--text-sm);
		background-color: var(--color-surface);
		border: 1px solid var(--color-accent);
		border-radius: 3px;
		color: var(--color-text-primary);
	}

	.letter-actions {
		position: absolute;
		right: var(--space-2);
		top: 50%;
		transform: translateY(-50%);
		display: none;
		gap: 2px;
	}

	.letter-item:hover .letter-actions {
		display: flex;
	}

	.action-btn {
		padding: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.action-btn:hover {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
	}

	.action-btn.delete:hover {
		color: #f87171;
		border-color: #f87171;
	}

	.empty-state {
		padding: var(--space-4);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>

