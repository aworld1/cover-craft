import { browser } from '$app/environment';
import { defaultProfile, type UserProfile } from '$lib/types';

const STORAGE_KEY = 'covercraft-profile';

class ProfileStore {
	profile = $state<UserProfile>({ ...defaultProfile });

	constructor() {
		if (browser) {
			this.load();
		}
	}

	private load() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				this.profile = { ...defaultProfile, ...JSON.parse(saved) };
			}
		} catch {
			this.profile = { ...defaultProfile };
		}
	}

	private save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
	}

	get hasResume(): boolean {
		return !!this.profile.resumeText;
	}

	get hasSenderInfo(): boolean {
		return !!(this.profile.senderName || this.profile.senderEmail);
	}

	updateProfile(updates: Partial<UserProfile>) {
		this.profile = { ...this.profile, ...updates };
		this.save();
	}

	setResume(text: string, fileName: string) {
		this.updateProfile({ resumeText: text, resumeFileName: fileName });
	}

	clearResume() {
		this.updateProfile({ resumeText: '', resumeFileName: '' });
	}

	clear() {
		this.profile = { ...defaultProfile };
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}
}

export const profileStore = new ProfileStore();

