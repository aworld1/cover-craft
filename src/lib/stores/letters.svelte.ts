import { browser } from '$app/environment';
import { createNewLetter, type Letter, type UserProfile } from '$lib/types';

const STORAGE_KEY = 'covercraft-letters';
const CURRENT_KEY = 'covercraft-current-letter';
const MAX_LETTERS = 50;

class LettersStore {
	letters = $state<Letter[]>([]);
	currentId = $state<string | null>(null);

	constructor() {
		if (browser) {
			this.load();
		}
	}

	private load() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				this.letters = JSON.parse(saved);
			}
			this.currentId = localStorage.getItem(CURRENT_KEY);
			
			// If no current letter or current doesn't exist, select first or create new
			if (!this.currentId || !this.letters.find(l => l.id === this.currentId)) {
				if (this.letters.length > 0) {
					this.currentId = this.letters[0].id;
				}
			}
		} catch {
			this.letters = [];
			this.currentId = null;
		}
	}

	private save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.letters));
		if (this.currentId) {
			localStorage.setItem(CURRENT_KEY, this.currentId);
		}
	}

	get current(): Letter | null {
		return this.letters.find(l => l.id === this.currentId) || null;
	}

	get sortedLetters(): Letter[] {
		return [...this.letters].sort((a, b) => 
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
	}

	createLetter(profile?: UserProfile): Letter {
		// Limit to MAX_LETTERS
		if (this.letters.length >= MAX_LETTERS) {
			// Remove oldest archived letter, or oldest letter
			const archived = this.letters.filter(l => l.status === 'archived');
			if (archived.length > 0) {
				const oldest = archived.sort((a, b) => 
					new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
				)[0];
				this.deleteLetter(oldest.id);
			} else {
				const oldest = this.sortedLetters[this.sortedLetters.length - 1];
				this.deleteLetter(oldest.id);
			}
		}

		const letter = createNewLetter(profile);
		this.letters.push(letter);
		this.currentId = letter.id;
		this.save();
		return letter;
	}

	selectLetter(id: string) {
		if (this.letters.find(l => l.id === id)) {
			this.currentId = id;
			this.save();
		}
	}

	updateLetter(id: string, updates: Partial<Letter>) {
		const index = this.letters.findIndex(l => l.id === id);
		if (index !== -1) {
			this.letters[index] = {
				...this.letters[index],
				...updates,
				updatedAt: new Date().toISOString()
			};
			this.save();
		}
	}

	updateCurrentData(data: Letter['data']) {
		if (this.currentId) {
			const letter = this.current;
			if (letter) {
				// Auto-name based on company if untitled
				let name = letter.name;
				if (name === 'Untitled Letter' && data.companyName) {
					name = data.companyName;
				}
				this.updateLetter(this.currentId, { data, name });
			}
		}
	}

	duplicateLetter(id: string): Letter | null {
		const original = this.letters.find(l => l.id === id);
		if (!original) return null;

		const now = new Date().toISOString();
		const duplicate: Letter = {
			...original,
			id: crypto.randomUUID(),
			name: `${original.name} (Copy)`,
			status: 'draft',
			createdAt: now,
			updatedAt: now
		};

		this.letters.push(duplicate);
		this.currentId = duplicate.id;
		this.save();
		return duplicate;
	}

	deleteLetter(id: string) {
		const index = this.letters.findIndex(l => l.id === id);
		if (index !== -1) {
			this.letters.splice(index, 1);
			
			// If we deleted the current letter, select another
			if (this.currentId === id) {
				this.currentId = this.letters.length > 0 ? this.letters[0].id : null;
			}
			this.save();
		}
	}

	renameLetter(id: string, name: string) {
		this.updateLetter(id, { name });
	}

	setStatus(id: string, status: Letter['status']) {
		this.updateLetter(id, { status });
	}

	setNotes(id: string, notes: string) {
		this.updateLetter(id, { notes });
	}

	setTemplate(id: string, template: Letter['template']) {
		this.updateLetter(id, { template });
	}

	// Migrate from old single-draft format
	migrateFromLegacy() {
		if (!browser) return;
		
		const legacyDraft = localStorage.getItem('covercraft-draft');
		if (legacyDraft && this.letters.length === 0) {
			try {
				const data = JSON.parse(legacyDraft);
				const letter = createNewLetter();
				letter.data = { ...letter.data, ...data };
				if (data.companyName) {
					letter.name = data.companyName;
				}
				this.letters.push(letter);
				this.currentId = letter.id;
				this.save();
				localStorage.removeItem('covercraft-draft');
			} catch {
				// Ignore migration errors
			}
		}
	}
}

export const lettersStore = new LettersStore();

