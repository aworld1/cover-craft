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

