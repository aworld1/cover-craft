import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'covercraft-theme';

class ThemeStore {
	theme = $state<Theme>('dark');

	constructor() {
		if (browser) {
			this.load();
			this.applyTheme();
		}
	}

	private load() {
		const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (saved) {
			this.theme = saved;
		} else {
			// Check system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.theme = prefersDark ? 'dark' : 'light';
		}
	}

	private applyTheme() {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', this.theme);
	}

	toggle() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
		if (browser) {
			localStorage.setItem(STORAGE_KEY, this.theme);
			this.applyTheme();
		}
	}
}

export const themeStore = new ThemeStore();

