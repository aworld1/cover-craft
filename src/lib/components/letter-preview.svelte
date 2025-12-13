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
		<div class="page">
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
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.preview-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.word-count {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.preview-wrapper {
		flex: 1;
		overflow: auto;
		padding: var(--space-6);
		background-color: var(--color-bg);
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.page {
		/* US Letter: 8.5" x 11" = 612 x 792 points */
		/* Fixed width, height grows with content */
		width: 510px;
		min-height: 660px; /* Minimum one page height */
		background-color: #ffffff;
		color: #1a1a1a;
		/* Scaled padding: 72pt * (510/612) ≈ 60px */
		padding: 60px;
		font-family: var(--font-serif);
		font-size: 9.2pt;
		line-height: 1.6;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.page {
			width: 100%;
			min-width: 320px;
			min-height: auto;
			padding: 40px;
			font-size: 8pt;
		}
	}

	.header-block {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 28px;
		padding-bottom: 16px;
		border-bottom: 1px solid #e5e5e5;
	}

	.sender-info {
		flex: 1;
	}

	.sender-name {
		font-weight: 600;
		font-size: 11.7pt;
		margin-bottom: 3px;
	}

	.sender-contact {
		font-size: 8.3pt;
		color: #525252;
	}

	.sender-address {
		font-size: 8.3pt;
		color: #525252;
	}

	.date {
		font-size: 8.3pt;
		color: #525252;
		text-align: right;
		white-space: nowrap;
	}

	.recipient-block {
		margin-bottom: 20px;
		line-height: 1.4;
	}

	.salutation {
		margin-bottom: 20px;
	}

	.body {
		margin-bottom: 12px;
	}

	.body p {
		margin: 0 0 10px 0;
		text-align: justify;
	}

	.body p:last-child {
		margin-bottom: 0;
	}

	.placeholder {
		color: #a3a3a3;
		font-style: italic;
	}

	.closing {
		line-height: 1.4;
	}

	.signature {
		margin-top: 16px;
		font-weight: 500;
	}
</style>

