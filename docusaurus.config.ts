import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'TDS Course',
  tagline: 'Tools in Data Science — IIT Madras',
  favicon: 'img/logo.svg',
  url: 'https://your-github-username.github.io',
  baseUrl: '/tds-course/',
  organizationName: 'iit-madras',
  projectName: 'tds-course',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  plugins: [
    async function tailwindPlugin() {
      return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions: { plugins: unknown[] }) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/iit-madras/tds-course/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  headTags: [
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' } },
    { tagName: 'link', attributes: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' } },
  ],
  themeConfig: {
    image: 'img/tds-social.png',
    colorMode: { defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true },
    navbar: {
      title: 'TDS Course',
      logo: { alt: 'TDS Logo', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Course' },
        { to: '/labs', label: 'Labs', position: 'left' },
        { to: '/reference/tools-glossary', label: 'Reference', position: 'left' },
        { type: 'search', position: 'right' },
        { href: 'https://github.com/iit-madras/tds-course', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Course', items: [{ label: 'Introduction', to: '/intro' }, { label: 'Chapter 1', to: '/chapter-1' }, { label: 'Labs', to: '/labs' }] },
        { title: 'IIT Madras', items: [{ label: 'Course Portal', href: 'https://study.iitm.ac.in' }, { label: 'Discourse Forum', href: 'https://discourse.onlinedegree.iitm.ac.in' }] },
        { title: 'More', items: [{ label: 'GitHub', href: 'https://github.com/iit-madras/tds-course' }] },
      ],
      copyright: `© ${new Date().getFullYear()} IIT Madras Online Degree Programme. Content under CC BY 4.0.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula, additionalLanguages: ['bash', 'python', 'yaml', 'docker', 'json', 'sql'] },
  } satisfies Preset.ThemeConfig,
};
export default config;
