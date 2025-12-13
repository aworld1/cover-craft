import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an expert cover letter writer. Write professional, compelling cover letters that:
- Are concise (3-4 paragraphs, under 400 words)
- Highlight relevant experience from the resume that matches the job
- Show genuine interest in the specific role and company
- Use a confident but not arrogant tone
- Avoid clichés and generic phrases
- Do NOT include any greeting (like "Dear...") or sign-off (like "Sincerely") - just the body paragraphs
- Separate paragraphs with double newlines`;

const USER_PROMPT = (resumeText: string, jobDescription: string) => `Write a cover letter body based on this resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Write only the body paragraphs of the cover letter. Do not include greeting or sign-off.`;

async function generateWithOpenAI(apiKey: string, resumeText: string, jobDescription: string): Promise<string> {
	const openai = new OpenAI({ apiKey });

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: USER_PROMPT(resumeText, jobDescription) }
		],
		temperature: 0.7,
		max_tokens: 1000
	});

	return completion.choices[0]?.message?.content || '';
}

async function generateWithGemini(apiKey: string, resumeText: string, jobDescription: string, modelId: string): Promise<string> {
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: modelId });

	const prompt = `${SYSTEM_PROMPT}\n\n${USER_PROMPT(resumeText, jobDescription)}`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	
	return response.text();
}

export const POST: RequestHandler = async ({ request }) => {
	const { resumeText, jobDescription, apiKey, provider, geminiModel } = await request.json();

	if (!apiKey) {
		return json({ error: 'API key is required' }, { status: 400 });
	}

	if (!resumeText || !jobDescription) {
		return json({ error: 'Resume and job description are required' }, { status: 400 });
	}

	try {
		let content: string;

		if (provider === 'gemini') {
			const modelId = geminiModel || 'gemini-2.5-flash';
			content = await generateWithGemini(apiKey, resumeText, jobDescription, modelId);
		} else {
			content = await generateWithOpenAI(apiKey, resumeText, jobDescription);
		}

		return json({ content });
	} catch (err) {
		const error = err as Error & { status?: number };
		console.error(`${provider || 'openai'} API error:`, error);

		if (error.status === 401 || error.message?.includes('API key')) {
			return json({ error: 'Invalid API key' }, { status: 401 });
		}

		return json({ error: 'Failed to generate cover letter' }, { status: 500 });
	}
};
