import { browser } from '$app/environment';

// Dynamic import to avoid SSR issues - pdfjs-dist requires browser APIs
export async function extractTextFromPDF(file: File): Promise<string> {
	if (!browser) {
		throw new Error('PDF extraction can only run in the browser');
	}

	// Dynamically import pdfjs-dist only in browser
	const pdfjsLib = await import('pdfjs-dist');
	
	// Use unpkg CDN for worker (more reliable for npm package versions)
	pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

	const arrayBuffer = await file.arrayBuffer();
	
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
	
	const textParts: string[] = [];
	
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const textContent = await page.getTextContent();
		const pageText = textContent.items
			.map((item) => ('str' in item ? item.str : ''))
			.join(' ');
		textParts.push(pageText);
	}
	
	return textParts.join('\n\n');
}
