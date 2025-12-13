import { jsPDF } from 'jspdf';
import type { LetterData } from './types';

// PDF dimensions and settings
const PAGE_WIDTH = 612; // US Letter width in points
const PAGE_HEIGHT = 792; // US Letter height in points
const MARGIN = 72; // 1 inch margins
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

export function generatePDF(data: LetterData): void {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'pt',
		format: 'letter'
	});

	let yPos = MARGIN;
	const headerStartY = yPos;

	// Set default font (using built-in fonts)
	doc.setFont('times', 'normal');

	// Sender Block (left side)
	if (data.senderName) {
		doc.setFontSize(14);
		doc.setFont('times', 'bold');
		doc.text(data.senderName, MARGIN, yPos);
		yPos += 16;
	}

	doc.setFontSize(10);
	doc.setFont('times', 'normal');
	doc.setTextColor(82, 82, 82);

	const contactParts = [];
	if (data.senderEmail) contactParts.push(data.senderEmail);
	if (data.senderPhone) contactParts.push(data.senderPhone);
	if (contactParts.length > 0) {
		doc.text(contactParts.join(' · '), MARGIN, yPos);
		yPos += 14;
	}

	if (data.senderAddress) {
		doc.text(data.senderAddress, MARGIN, yPos);
		yPos += 14;
	}

	// Date (right-aligned, at top of header)
	doc.setFontSize(10);
	doc.setTextColor(82, 82, 82);
	const dateWidth = doc.getTextWidth(data.date);
	doc.text(data.date, PAGE_WIDTH - MARGIN - dateWidth, headerStartY);

	// Divider line
	yPos += 8;
	doc.setDrawColor(229, 229, 229);
	doc.setLineWidth(0.5);
	doc.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
	yPos += 20;

	// Recipient Block
	doc.setTextColor(26, 26, 26);
	doc.setFontSize(11);

	if (data.recipientName) {
		doc.text(data.recipientName, MARGIN, yPos);
		yPos += 14;
	}
	if (data.recipientTitle) {
		doc.text(data.recipientTitle, MARGIN, yPos);
		yPos += 14;
	}
	if (data.companyName) {
		doc.text(data.companyName, MARGIN, yPos);
		yPos += 14;
	}
	if (data.companyAddress) {
		doc.text(data.companyAddress, MARGIN, yPos);
		yPos += 14;
	}

	yPos += 24;

	// Salutation
	const salutation = data.salutation || 'Dear Hiring Manager';
	doc.text(`${salutation},`, MARGIN, yPos);
	yPos += 24;

	// Body - Split into paragraphs and handle text wrapping
	if (data.body) {
		const paragraphs = data.body.split('\n\n');

		for (const paragraph of paragraphs) {
			// Clean up the paragraph text
			const cleanParagraph = paragraph.replace(/\n/g, ' ').trim();
			if (!cleanParagraph) continue;

			// Split text to fit within content width
			const lines = doc.splitTextToSize(cleanParagraph, CONTENT_WIDTH);

			for (const line of lines) {
				// Check if we need a new page
				if (yPos > PAGE_HEIGHT - MARGIN - 60) {
					doc.addPage();
					yPos = MARGIN;
				}

				doc.text(line, MARGIN, yPos);
				yPos += 16;
			}

			yPos += 8; // Extra space between paragraphs
		}
	}

	yPos += 8;

	// Closing
	const signOff = data.signOff || 'Sincerely';
	doc.text(`${signOff},`, MARGIN, yPos);
	yPos += 24;

	// Signature
	if (data.senderName) {
		doc.setFont('times', 'normal');
		doc.text(data.senderName, MARGIN, yPos);
	}

	// Generate filename
	const filename = data.companyName
		? `Cover_Letter_${data.companyName.replace(/\s+/g, '_')}.pdf`
		: 'Cover_Letter.pdf';

	// Download the PDF
	doc.save(filename);
}

