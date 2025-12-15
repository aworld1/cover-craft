<script lang="ts">
	import type { LetterData } from '$lib/types';

	interface Props {
		data: LetterData;
	}

	let { data }: Props = $props();

	// Calculate word count from body
	const wordCount = $derived(
		data.body.trim() ? data.body.trim().split(/\s+/).length : 0
	);
</script>

<div class="preview-container">
	<div class="preview-header">
		<span class="preview-label">Preview</span>
		<span class="word-count">{wordCount} words</span>
	</div>
	
	<div class="preview-wrapper">
		<!-- Ambient glow behind the page -->
		<div class="ambient-glow"></div>
		
		<div class="page">
			<!-- Paper texture overlay -->
			<div class="paper-texture"></div>
			
			<!-- Corner fold effect -->
			<div class="corner-fold"></div>
			
			<!-- Header: Sender Info + Date -->
			<header class="header-block">
				<div class="sender-info">
					{#if data.senderName}
						<div class="sender-name">{data.senderName}</div>
					{/if}
					<div class="sender-contact">
						{#if data.senderEmail}{data.senderEmail}{/if}
						{#if data.senderEmail && data.senderPhone} · {/if}
						{#if data.senderPhone}{data.senderPhone}{/if}
					</div>
					{#if data.senderAddress}
						<div class="sender-address">{data.senderAddress}</div>
					{/if}
				</div>
				<div class="date">{data.date}</div>
			</header>

			<!-- Recipient Info -->
			<div class="recipient-block">
				{#if data.recipientName}
					<div>{data.recipientName}</div>
				{/if}
				{#if data.recipientTitle}
					<div>{data.recipientTitle}</div>
				{/if}
				{#if data.companyName}
					<div>{data.companyName}</div>
				{/if}
				{#if data.companyAddress}
					<div>{data.companyAddress}</div>
				{/if}
			</div>

			<!-- Salutation -->
			<div class="salutation">
				{data.salutation},
			</div>

			<!-- Body -->
			<div class="body">
				{#if data.body}
					{#each data.body.split('\n\n') as paragraph}
						<p>{paragraph}</p>
					{/each}
				{:else}
					<p class="placeholder">Your cover letter content will appear here...</p>
				{/if}
			</div>

			<!-- Closing -->
			<div class="closing">
				<div>{data.signOff},</div>
				{#if data.senderName}
					<div class="signature">{data.senderName}</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.preview-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		animation: fadeIn 0.4s var(--transition-smooth);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.preview-label {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-muted);
		letter-spacing: 0.02em;
	}

	.word-count {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-2);
		background-color: var(--color-surface-elevated);
		border-radius: var(--radius-sm);
	}

	.preview-wrapper {
		flex: 1;
		overflow: auto;
		padding: var(--space-8);
		background-color: var(--color-bg);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		position: relative;
	}

	/* Ambient glow behind page */
	.ambient-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 400px;
		height: 500px;
		background: radial-gradient(
			ellipse at center,
			var(--color-accent-glow) 0%,
			transparent 70%
		);
		opacity: 0.3;
		pointer-events: none;
		filter: blur(60px);
	}

	.page {
		position: relative;
		/* US Letter: 8.5" x 11" = 612 x 792 points */
		width: 510px;
		min-height: 660px;
		background-color: #fffef9;
		color: #1a1714;
		padding: 60px;
		font-family: var(--font-serif);
		font-size: 9.2pt;
		line-height: 1.6;
		box-shadow: var(--shadow-page);
		flex-shrink: 0;
		animation: floatUp 0.5s var(--transition-smooth);
		overflow: hidden;
	}

	/* Paper texture overlay */
	.paper-texture {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		opacity: 0.03;
		pointer-events: none;
	}

	/* Corner fold effect */
	.corner-fold {
		position: absolute;
		top: 0;
		right: 0;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 24px 24px 0;
		border-color: transparent var(--color-bg) transparent transparent;
		filter: drop-shadow(-1px 1px 1px rgba(0,0,0,0.1));
	}

	.corner-fold::before {
		content: '';
		position: absolute;
		top: 0;
		right: -24px;
		width: 24px;
		height: 24px;
		background: linear-gradient(
			135deg,
			#f5f3ee 0%,
			#e8e5de 100%
		);
		border-radius: 0 0 0 2px;
	}

	@media (max-width: 640px) {
		.page {
			width: 100%;
			min-width: 320px;
			min-height: auto;
			padding: 40px;
			font-size: 8pt;
		}

		.preview-wrapper {
			padding: var(--space-4);
		}

		.ambient-glow {
			display: none;
		}
	}

	.header-block {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 28px;
		padding-bottom: 16px;
		border-bottom: 1px solid #e5e2dc;
		position: relative;
	}

	.sender-info {
		flex: 1;
	}

	.sender-name {
		font-weight: 600;
		font-size: 11.7pt;
		margin-bottom: 3px;
		color: #1a1714;
	}

	.sender-contact {
		font-size: 8.3pt;
		color: #52504a;
	}

	.sender-address {
		font-size: 8.3pt;
		color: #52504a;
	}

	.date {
		font-size: 8.3pt;
		color: #52504a;
		text-align: right;
		white-space: nowrap;
	}

	.recipient-block {
		margin-bottom: 20px;
		line-height: 1.4;
		color: #1a1714;
	}

	.salutation {
		margin-bottom: 20px;
		color: #1a1714;
	}

	.body {
		margin-bottom: 12px;
		color: #1a1714;
	}

	.body p {
		margin: 0 0 10px 0;
		text-align: justify;
	}

	.body p:last-child {
		margin-bottom: 0;
	}

	.placeholder {
		color: #a8a098;
		font-style: italic;
	}

	.closing {
		line-height: 1.4;
		color: #1a1714;
	}

	.signature {
		margin-top: 16px;
		font-weight: 500;
		font-family: var(--font-display);
		font-size: 10pt;
	}
</style>
