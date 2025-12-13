# CoverCraft

Professional cover letter generator for tech professionals. Paste your content, preview in real-time, download as PDF.

## Features

- **Live Preview** — See your letter formatted in real-time as you type
- **PDF Generation** — Download a professionally formatted cover letter PDF
- **Auto-Save** — Your draft is automatically saved to localStorage
- **Responsive** — Works on desktop and mobile devices
- **Dark Mode** — Easy on the eyes, built for developers

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **SvelteKit** — Full-stack framework
- **Svelte 5** — Runes-based reactivity
- **Tailwind CSS v4** — Utility-first styling
- **jsPDF** — Client-side PDF generation
- **TypeScript** — Type safety

## Design Philosophy

Built with a Linear/Raycast-inspired aesthetic:
- Dark, focused interface
- Monospace labels for that developer-tool feel
- Serif font in the PDF for timeless professionalism
- No visual clutter — every element earns its space

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── button.svelte        # Primary action button
│   │   ├── letter-preview.svelte # Live A4 preview
│   │   ├── text-area.svelte     # Multi-line input
│   │   └── text-field.svelte    # Single-line input
│   ├── pdf-generator.ts         # jsPDF wrapper
│   └── types.ts                 # TypeScript interfaces
├── routes/
│   ├── +layout.svelte           # Root layout
│   └── +page.svelte             # Main application
├── app.css                      # Design tokens & base styles
└── app.html                     # HTML template
```
