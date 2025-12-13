import { jsPDF } from 'jspdf';
import type { LetterData } from './types';

// PDF dimensions and settings
const PAGE_WIDTH = 612; // US Letter width in points
const PAGE_HEIGHT = 792; // US Letter height in points
const MARGIN = 72; // 1 inch margins
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

export type PDFTemplate = 'classic' | 'modern' | 'bold';

interface TemplateConfig {
	headerFont: string;
	bodyFont: string;
	accentColor: [number, number, number];
}

const templates: Record<PDFTemplate, TemplateConfig> = {
	classic: {
		headerFont: 'times',
		bodyFont: 'times',
		accentColor: [82, 82, 82]
	},
	modern: {
		headerFont: 'helvetica',
		bodyFont: 'helvetica',
		accentColor: [100, 100, 100]
	},
	bold: {
		headerFont: 'helvetica',
		bodyFont: 'helvetica',
		accentColor: [34, 211, 238] // Cyan accent
	}
};

function generateClassicPDF(doc: jsPDF, data: LetterData): void {
	const config = templates.classic;
	let yPos = MARGIN;
	const headerStartY = yPos;

	doc.setFont(config.bodyFont, 'normal');

	// Sender Block (left side)
	if (data.senderName) {
		doc.setFontSize(14);
		doc.setFont(config.headerFont, 'bold');
		doc.text(data.senderName, MARGIN, yPos);
		yPos += 16;
	}

	doc.setFontSize(10);
	doc.setFont(config.bodyFont, 'normal');
	doc.setTextColor(...config.accentColor);

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
	doc.setTextColor(...config.accentColor);
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

	// Body
	yPos = renderBody(doc, data.body, yPos, config.bodyFont);

	// Closing
	const signOff = data.signOff || 'Sincerely';
	doc.text(`${signOff},`, MARGIN, yPos);
	yPos += 24;

	if (data.senderName) {
		doc.setFont(config.bodyFont, 'normal');
		doc.text(data.senderName, MARGIN, yPos);
	}
}

function generateModernPDF(doc: jsPDF, data: LetterData): void {
	const config = templates.modern;
	let yPos = MARGIN;

	// Modern: Clean, minimal, lots of whitespace
	doc.setFont(config.bodyFont, 'normal');

	// Sender name - large and bold at top
	if (data.senderName) {
		doc.setFontSize(22);
		doc.setFont(config.headerFont, 'bold');
		doc.setTextColor(26, 26, 26);
		doc.text(data.senderName, MARGIN, yPos);
		yPos += 28;
	}

	// Contact info on one line
	doc.setFontSize(9);
	doc.setFont(config.bodyFont, 'normal');
	doc.setTextColor(...config.accentColor);
	
	const contactParts = [];
	if (data.senderEmail) contactParts.push(data.senderEmail);
	if (data.senderPhone) contactParts.push(data.senderPhone);
	if (data.senderAddress) contactParts.push(data.senderAddress);
	if (contactParts.length > 0) {
		doc.text(contactParts.join('  |  '), MARGIN, yPos);
		yPos += 20;
	}

	// Thin line
	doc.setDrawColor(200, 200, 200);
	doc.setLineWidth(0.25);
	doc.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
	yPos += 30;

	// Date
	doc.setFontSize(10);
	doc.setTextColor(...config.accentColor);
	doc.text(data.date, MARGIN, yPos);
	yPos += 24;

	// Recipient
	doc.setTextColor(26, 26, 26);
	doc.setFontSize(10);

	if (data.recipientName) {
		doc.text(data.recipientName, MARGIN, yPos);
		yPos += 13;
	}
	if (data.recipientTitle) {
		doc.text(data.recipientTitle, MARGIN, yPos);
		yPos += 13;
	}
	if (data.companyName) {
		doc.setFont(config.bodyFont, 'bold');
		doc.text(data.companyName, MARGIN, yPos);
		doc.setFont(config.bodyFont, 'normal');
		yPos += 13;
	}
	if (data.companyAddress) {
		doc.text(data.companyAddress, MARGIN, yPos);
		yPos += 13;
	}

	yPos += 20;

	// Salutation
	doc.setFontSize(11);
	const salutation = data.salutation || 'Dear Hiring Manager';
	doc.text(`${salutation},`, MARGIN, yPos);
	yPos += 26;

	// Body
	yPos = renderBody(doc, data.body, yPos, config.bodyFont);

	// Closing
	const signOff = data.signOff || 'Sincerely';
	doc.text(`${signOff},`, MARGIN, yPos);
	yPos += 28;

	if (data.senderName) {
		doc.setFont(config.bodyFont, 'bold');
		doc.text(data.senderName, MARGIN, yPos);
	}
}

function generateBoldPDF(doc: jsPDF, data: LetterData): void {
	const config = templates.bold;
	let yPos = MARGIN;

	// Bold: Strong typography, accent color sidebar
	doc.setFont(config.bodyFont, 'normal');

	// Accent sidebar
	doc.setFillColor(...config.accentColor);
	doc.rect(0, 0, 6, PAGE_HEIGHT, 'F');

	// Large bold name
	if (data.senderName) {
		doc.setFontSize(28);
		doc.setFont(config.headerFont, 'bold');
		doc.setTextColor(26, 26, 26);
		doc.text(data.senderName.toUpperCase(), MARGIN, yPos);
		yPos += 32;
	}

	// Contact in accent color
	doc.setFontSize(9);
	doc.setFont(config.bodyFont, 'normal');
	doc.setTextColor(...config.accentColor);
	
	const contactParts = [];
	if (data.senderEmail) contactParts.push(data.senderEmail);
	if (data.senderPhone) contactParts.push(data.senderPhone);
	if (data.senderAddress) contactParts.push(data.senderAddress);
	if (contactParts.length > 0) {
		doc.text(contactParts.join('  ·  '), MARGIN, yPos);
		yPos += 30;
	}

	// Date right-aligned
	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	const dateWidth = doc.getTextWidth(data.date);
	doc.text(data.date, PAGE_WIDTH - MARGIN - dateWidth, yPos);
	
	// Recipient on left
	doc.setTextColor(26, 26, 26);

	if (data.recipientName) {
		doc.setFont(config.bodyFont, 'bold');
		doc.text(data.recipientName, MARGIN, yPos);
		doc.setFont(config.bodyFont, 'normal');
		yPos += 14;
	}
	if (data.recipientTitle) {
		doc.text(data.recipientTitle, MARGIN, yPos);
		yPos += 13;
	}
	if (data.companyName) {
		doc.text(data.companyName, MARGIN, yPos);
		yPos += 13;
	}
	if (data.companyAddress) {
		doc.text(data.companyAddress, MARGIN, yPos);
		yPos += 13;
	}

	yPos += 24;

	// Salutation with accent
	doc.setFontSize(11);
	doc.setTextColor(...config.accentColor);
	const salutation = data.salutation || 'Dear Hiring Manager';
	doc.text(`${salutation},`, MARGIN, yPos);
	doc.setTextColor(26, 26, 26);
	yPos += 26;

	// Body
	yPos = renderBody(doc, data.body, yPos, config.bodyFont);

	// Closing
	const signOff = data.signOff || 'Sincerely';
	doc.setTextColor(...config.accentColor);
	doc.text(`${signOff},`, MARGIN, yPos);
	yPos += 28;

	if (data.senderName) {
		doc.setFont(config.bodyFont, 'bold');
		doc.setTextColor(26, 26, 26);
		doc.text(data.senderName, MARGIN, yPos);
	}
}

function renderBody(doc: jsPDF, body: string, startY: number, font: string): number {
	let yPos = startY;
	doc.setFont(font, 'normal');
	doc.setFontSize(11);
	doc.setTextColor(26, 26, 26);

	if (body) {
		const paragraphs = body.split('\n\n');

		for (const paragraph of paragraphs) {
			const cleanParagraph = paragraph.replace(/\n/g, ' ').trim();
			if (!cleanParagraph) continue;

			const lines = doc.splitTextToSize(cleanParagraph, CONTENT_WIDTH);

			for (const line of lines) {
				if (yPos > PAGE_HEIGHT - MARGIN - 60) {
					doc.addPage();
					yPos = MARGIN;
				}

				doc.text(line, MARGIN, yPos);
				yPos += 16;
			}

			yPos += 8;
		}
	}

	yPos += 8;
	return yPos;
}

export function generatePDF(data: LetterData, template: PDFTemplate = 'classic'): void {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'pt',
		format: 'letter'
	});

	switch (template) {
		case 'modern':
			generateModernPDF(doc, data);
			break;
		case 'bold':
			generateBoldPDF(doc, data);
			break;
		case 'classic':
		default:
			generateClassicPDF(doc, data);
			break;
	}

	// Generate filename
	const filename = data.companyName
		? `Cover_Letter_${data.companyName.replace(/\s+/g, '_')}.pdf`
		: 'Cover_Letter.pdf';

	doc.save(filename);
}
