export interface LetterData {
	senderName: string;
	senderEmail: string;
	senderPhone: string;
	senderAddress: string;
	recipientName: string;
	recipientTitle: string;
	companyName: string;
	companyAddress: string;
	date: string;
	salutation: string;
	body: string;
	signOff: string;
}

export type LetterStatus = 'draft' | 'sent' | 'interview' | 'offer' | 'rejected' | 'archived';

export interface Letter {
	id: string;
	name: string;
	data: LetterData;
	status: LetterStatus;
	notes: string;
	template: 'classic' | 'modern' | 'bold';
	createdAt: string;
	updatedAt: string;
}

export interface UserProfile {
	senderName: string;
	senderEmail: string;
	senderPhone: string;
	senderAddress: string;
	resumeText: string;
	resumeFileName: string;
}

export const defaultLetterData: LetterData = {
	senderName: '',
	senderEmail: '',
	senderPhone: '',
	senderAddress: '',
	recipientName: '',
	recipientTitle: '',
	companyName: '',
	companyAddress: '',
	date: new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}),
	salutation: 'Dear Hiring Manager',
	body: '',
	signOff: 'Sincerely'
};

export const defaultProfile: UserProfile = {
	senderName: '',
	senderEmail: '',
	senderPhone: '',
	senderAddress: '',
	resumeText: '',
	resumeFileName: ''
};

export function createNewLetter(profile?: UserProfile): Letter {
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		name: 'Untitled Letter',
		data: {
			...defaultLetterData,
			senderName: profile?.senderName || '',
			senderEmail: profile?.senderEmail || '',
			senderPhone: profile?.senderPhone || '',
			senderAddress: profile?.senderAddress || ''
		},
		status: 'draft',
		notes: '',
		template: 'classic',
		createdAt: now,
		updatedAt: now
	};
}

export const signOffOptions = [
	'Sincerely',
	'Best regards',
	'Kind regards',
	'Regards',
	'Best',
	'Warmly',
	'Thank you',
	'With appreciation',
	'Respectfully'
];

export const statusLabels: Record<LetterStatus, string> = {
	draft: 'Draft',
	sent: 'Sent',
	interview: 'Interview',
	offer: 'Offer',
	rejected: 'Rejected',
	archived: 'Archived'
};

export const statusColors: Record<LetterStatus, string> = {
	draft: '#737373',
	sent: '#22d3ee',
	interview: '#a78bfa',
	offer: '#4ade80',
	rejected: '#f87171',
	archived: '#525252'
};
