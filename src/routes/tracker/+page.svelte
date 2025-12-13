<script lang="ts">
	import { lettersStore } from '$lib/stores/letters.svelte';
	import StatusBadge from '$lib/components/status-badge.svelte';
	import Button from '$lib/components/button.svelte';
	import { statusLabels, type LetterStatus } from '$lib/types';

	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function handleStatusChange(id: string, e: Event) {
		const target = e.target as HTMLSelectElement;
		lettersStore.setStatus(id, target.value as LetterStatus);
	}

	function handleNotesChange(id: string, e: Event) {
		const target = e.target as HTMLInputElement;
		lettersStore.setNotes(id, target.value);
	}

	function handleExportCSV() {
		const headers = ['Company', 'Status', 'Date Applied', 'Last Updated', 'Notes'];
		const rows = lettersStore.sortedLetters.map(letter => [
			letter.name,
			statusLabels[letter.status],
			formatDate(letter.createdAt),
			formatDate(letter.updatedAt),
			letter.notes.replace(/,/g, ';') // Escape commas
		]);

		const csv = [
			headers.join(','),
			...rows.map(row => row.map(cell => `"${cell}"`).join(','))
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `covercraft-applications-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleViewLetter(id: string) {
		lettersStore.selectLetter(id);
		window.location.href = '/';
	}

	// Stats
	const stats = $derived({
		total: lettersStore.letters.length,
		sent: lettersStore.letters.filter(l => l.status === 'sent').length,
		interviews: lettersStore.letters.filter(l => l.status === 'interview').length,
		offers: lettersStore.letters.filter(l => l.status === 'offer').length
	});
</script>

<svelte:head>
	<title>Application Tracker — CoverCraft</title>
</svelte:head>

<div class="tracker">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/" class="back-link">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</a>
				<h1 class="title">Application Tracker</h1>
			</div>
			<Button variant="secondary" size="sm" onclick={handleExportCSV} disabled={lettersStore.letters.length === 0}>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 10v2h10v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Export CSV
			</Button>
		</div>
	</header>

	<!-- Stats -->
	<div class="stats">
		<div class="stat">
			<span class="stat-value">{stats.total}</span>
			<span class="stat-label">Total</span>
		</div>
		<div class="stat">
			<span class="stat-value">{stats.sent}</span>
			<span class="stat-label">Sent</span>
		</div>
		<div class="stat">
			<span class="stat-value">{stats.interviews}</span>
			<span class="stat-label">Interviews</span>
		</div>
		<div class="stat">
			<span class="stat-value">{stats.offers}</span>
			<span class="stat-label">Offers</span>
		</div>
	</div>

	<!-- Table -->
	<div class="table-container">
		{#if lettersStore.letters.length === 0}
			<div class="empty-state">
				<p>No applications yet.</p>
				<a href="/">Create your first cover letter</a>
			</div>
		{:else}
			<table class="table">
				<thead>
					<tr>
						<th>Company</th>
						<th>Status</th>
						<th>Applied</th>
						<th>Notes</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each lettersStore.sortedLetters as letter (letter.id)}
						<tr>
							<td class="company-cell">
								<span class="company-name">{letter.name}</span>
								{#if letter.data.recipientTitle}
									<span class="company-role">{letter.data.recipientTitle}</span>
								{/if}
							</td>
							<td>
								<select 
									class="status-select"
									value={letter.status}
									onchange={(e) => handleStatusChange(letter.id, e)}
								>
									{#each Object.entries(statusLabels) as [value, label]}
										<option {value}>{label}</option>
									{/each}
								</select>
							</td>
							<td class="date-cell">{formatDate(letter.createdAt)}</td>
							<td class="notes-cell">
								<input 
									type="text"
									class="notes-input"
									placeholder="Add notes..."
									value={letter.notes}
									onchange={(e) => handleNotesChange(letter.id, e)}
								/>
							</td>
							<td class="actions-cell">
								<button 
									class="view-btn"
									onclick={() => handleViewLetter(letter.id)}
									title="View letter"
								>
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
										<path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.5"/>
										<circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/>
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.tracker {
		min-height: 100vh;
		background-color: var(--color-bg);
	}

	/* Header */
	.header {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		max-width: 1200px;
		margin: 0 auto;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.back-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		color: var(--color-text-secondary);
		transition: all var(--transition-fast);
	}

	.back-link:hover {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
	}

	.title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	/* Stats */
	.stats {
		display: flex;
		gap: var(--space-6);
		padding: var(--space-6);
		max-width: 1200px;
		margin: 0 auto;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Table */
	.table-container {
		padding: 0 var(--space-6) var(--space-6);
		max-width: 1200px;
		margin: 0 auto;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		background-color: var(--color-surface);
		border-radius: 8px;
		overflow: hidden;
	}

	.table th {
		text-align: left;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--color-border);
	}

	.table td {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}

	.table tr:last-child td {
		border-bottom: none;
	}

	.table tr:hover {
		background-color: var(--color-surface-elevated);
	}

	.company-cell {
		min-width: 150px;
	}

	.company-name {
		display: block;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.company-role {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: 2px;
	}

	.date-cell {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.status-select {
		padding: var(--space-1) var(--space-2);
		padding-right: 24px;
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
		background-position: right 6px center;
	}

	.notes-cell {
		min-width: 200px;
	}

	.notes-input {
		width: 100%;
		padding: var(--space-2);
		background-color: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		transition: all var(--transition-fast);
	}

	.notes-input:hover {
		border-color: var(--color-border);
	}

	.notes-input:focus {
		outline: none;
		border-color: var(--color-accent);
		background-color: var(--color-surface-elevated);
	}

	.notes-input::placeholder {
		color: var(--color-text-muted);
	}

	.actions-cell {
		width: 40px;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.view-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-12);
		color: var(--color-text-muted);
	}

	.empty-state a {
		color: var(--color-accent);
		text-decoration: none;
	}

	.empty-state a:hover {
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.stats {
			padding: var(--space-4);
			gap: var(--space-4);
		}

		.table-container {
			padding: 0 var(--space-4) var(--space-4);
			overflow-x: auto;
		}

		.table {
			min-width: 600px;
		}

		.header-content {
			padding: var(--space-3) var(--space-4);
		}
	}
</style>

