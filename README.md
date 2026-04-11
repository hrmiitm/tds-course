# TDS Course — Tools in Data Science

A comprehensive course documentation site for **Tools in Data Science** at IIT Madras, built with [Docusaurus 3](https://docusaurus.io/).

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Local Development

```bash
npm run start
```

Opens a dev server at `http://localhost:3000`. Most changes are reflected live without restarting.

### Build

```bash
npm run build
```

Generates static content into the `build/` directory.

### Deployment

The site deploys automatically to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Project Structure

```
tds-course/
├── docs/                   # Course content (Markdown)
│   ├── intro.md            # Introduction
│   ├── chapter-1/          # MLOps Foundations
│   ├── chapter-2/          # DevOps Tooling
│   ├── chapter-3/          # Cloud Platforms
│   ├── labs/               # Graded lab exercises
│   └── reference/          # Tools glossary & cheatsheet
├── src/
│   ├── components/         # React components
│   │   ├── CodePanel/      # VS Code terminal drawer
│   │   ├── HomepageHero/   # Landing page hero
│   │   ├── FeatureCard/    # Feature showcase cards
│   │   ├── LabCard/        # Lab exercise cards
│   │   ├── CourseProgress/ # Progress tracking bar
│   │   └── MarkComplete/   # Mark-as-complete button
│   ├── pages/              # Custom pages
│   ├── theme/              # Docusaurus theme swizzle
│   └── css/custom.css      # Global styles & CSS variables
├── static/img/             # Static assets
├── docusaurus.config.ts    # Docusaurus configuration
├── sidebars.ts             # Sidebar navigation
└── tailwind.config.js      # Tailwind CSS configuration
```

## Features

- **Built-in code terminal** — Connect your local code-server via cloudflared tunnel (Ctrl+`)
- **Course progress tracking** — localStorage-based completion tracking
- **Dark mode** — Full dark theme support with automatic system preference detection
- **Full-text search** — Powered by Docusaurus search
- **Responsive design** — Works on desktop, tablet, and mobile

## Tech Stack

- [Docusaurus 3.7](https://docusaurus.io/) — Static site generator
- [React 19](https://react.dev/) — UI components
- [Tailwind CSS 3.4](https://tailwindcss.com/) — Utility-first CSS
- [Lucide React](https://lucide.dev/) — Icon library
- [TypeScript](https://www.typescriptlang.org/) — Type safety

## License

Content is licensed under CC BY 4.0. © IIT Madras Online Degree Programme.
