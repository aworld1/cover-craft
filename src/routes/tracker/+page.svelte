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
				<div class="header-title">
					<h1 class="title">Application Tracker</h1>
					<p class="subtitle">Track your job application journey</p>
				</div>
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

	<div class="main-content">
		<!-- Stats -->
		<div class="stats">
			<div class="stat-card">
				<div class="stat-icon total">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M3 4h14M3 8h14M3 12h10M3 16h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.total}</span>
					<span class="stat-label">Total Applications</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon sent">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M18 2L9 11M18 2l-5 16-4-7-7-4 16-5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.sent}</span>
					<span class="stat-label">Sent</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon interview">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<circle cx="10" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
						<path d="M2 18c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.interviews}</span>
					<span class="stat-label">Interviews</span>
				</div>
			</div>
			<div class="stat-card highlight">
				<div class="stat-icon offer">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.offers}</span>
					<span class="stat-label">Offers</span>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="table-section">
			<div class="section-header">
				<h2 class="section-title">All Applications</h2>
				<span class="section-count">{lettersStore.letters.length} total</span>
			</div>

			<div class="table-container">
				{#if lettersStore.letters.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
								<rect x="6" y="10" width="36" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
								<path d="M6 18h36" stroke="currentColor" stroke-width="2"/>
								<path d="M14 26h8M14 32h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
						<p class="empty-text">No applications yet.</p>
						<a href="/" class="empty-link">Create your first cover letter →</a>
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
							{#each lettersStore.sortedLetters as letter, index (letter.id)}
								<tr style="animation-delay: {index * 30}ms">
									<td class="company-cell">
										<span class="company-name">{letter.name}</span>
										{#if letter.data.recipientTitle}
											<span class="company-role">{letter.data.recipientTitle}</span>
										{/if}
									</td>
									<td>
										<div class="status-wrapper">
											<select 
												class="status-select"
												value={letter.status}
												onchange={(e) => handleStatusChange(letter.id, e)}
											>
												{#each Object.entries(statusLabels) as [value, label]}
													<option {value}>{label}</option>
												{/each}
											</select>
											<div class="select-arrow">
												<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
													<path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
												</svg>
											</div>
										</div>
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
	</div>
</div>

<style>
	.tracker {
		min-height: 100vh;
		background-color: var(--color-bg);
		animation: fadeIn 0.4s var(--transition-smooth);
	}

	/* Header */
	.header {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
		position: sticky;
		top: 0;
		z-index: 10;
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
		gap: var(--space-4);
	}

	.back-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.back-link:hover {
		color: var(--color-text-primary);
		border-color: var(--color-text-muted);
		transform: translateX(-2px);
	}

	.header-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-6);
	}

	/* Stats */
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all 0.2s ease;
		animation: fadeInUp 0.4s var(--transition-smooth) backwards;
	}

	.stat-card:nth-child(1) { animation-delay: 0.1s; }
	.stat-card:nth-child(2) { animation-delay: 0.15s; }
	.stat-card:nth-child(3) { animation-delay: 0.2s; }
	.stat-card:nth-child(4) { animation-delay: 0.25s; }

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.stat-card.highlight {
		background: linear-gradient(
			135deg,
			var(--color-surface) 0%,
			var(--color-accent-muted) 100%
		);
		border-color: var(--color-accent);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.stat-icon.total {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-secondary);
	}

	.stat-icon.sent {
		background-color: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.stat-icon.interview {
		background-color: rgba(168, 85, 247, 0.15);
		color: #a855f7;
	}

	.stat-icon.offer {
		background-color: var(--color-accent-muted);
		color: var(--color-accent);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	/* Table Section */
	.table-section {
		animation: fadeInUp 0.4s var(--transition-smooth) 0.3s backwards;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.section-count {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-3);
		background-color: var(--color-surface-elevated);
		border-radius: var(--radius-md);
	}

	.table-container {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th {
		text-align: left;
		padding: var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.table td {
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}

	.table tbody tr {
		animation: fadeInUp 0.3s var(--transition-smooth) backwards;
		transition: all 0.15s ease;
	}

	.table tr:last-child td {
		border-bottom: none;
	}

	.table tbody tr:hover {
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

	.status-wrapper {
		position: relative;
		display: inline-block;
	}

	.status-select {
		padding: var(--space-1) var(--space-2);
		padding-right: 28px;
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		appearance: none;
		transition: all 0.2s ease;
	}

	.status-select:hover {
		border-color: var(--color-text-muted);
	}

	.status-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.status-wrapper .select-arrow {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.notes-cell {
		min-width: 200px;
	}

	.notes-input {
		width: 100%;
		padding: var(--space-2);
		background-color: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		transition: all 0.2s ease;
	}

	.notes-input:hover {
		border-color: var(--color-border);
		background-color: var(--color-surface-elevated);
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
		width: 32px;
		height: 32px;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		transform: scale(1.05);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16);
	}

	.empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background-color: var(--color-surface-elevated);
		border-radius: 50%;
		color: var(--color-text-muted);
		margin-bottom: var(--space-4);
	}

	.empty-text {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-2) 0;
	}

	.empty-link {
		font-size: var(--text-sm);
		color: var(--color-accent);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.empty-link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.main-content {
			padding: var(--space-4);
		}

		.stats {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.table-container {
			overflow-x: auto;
		}

		.table {
			min-width: 600px;
		}

		.header-content {
			padding: var(--space-3) var(--space-4);
			flex-direction: column;
			gap: var(--space-3);
			align-items: stretch;
		}

		.header-left {
			flex-direction: row;
		}

		.subtitle {
			display: none;
		}
	}
</style>
