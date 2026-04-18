import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkGfm from 'remark-gfm';

const SITE_URL = process.env.SITE_URL ?? 'https://iit-madras.github.io';
const BASE_URL = process.env.BASE_URL ?? '/';

const config: Config = {
  title: 'TDS Course',
  tagline: 'Tools in Data Science — Learn. Code. Deploy.',
  favicon: 'img/logo.svg',

  url: SITE_URL,
  baseUrl: BASE_URL,

  organizationName: 'iit-madras',
  projectName: 'tds-course',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    async function tailwindPlugin() {
      return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        explicitSearchResultPath: true,
      },
    ],
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
          remarkPlugins: [remarkGfm],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    },
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'TDS Course',
      logo: {
        alt: 'TDS Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Course',
        },
        {
          to: '/#features',
          label: 'Features',
          position: 'left',
        },
        {
          to: '/#progress',
          label: 'Progress',
          position: 'left',
        },
        {
          to: '/labs',
          label: 'Labs',
          position: 'left',
        },
        {
          href: 'https://github.com/iit-madras/tds-course',
          label: 'Community',
          position: 'left',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          to: '/intro',
          label: 'Start Learning',
          position: 'right',
          className: 'tds-navbar-cta',
        },
        {
          href: 'https://github.com/iit-madras/tds-course',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'yaml', 'docker', 'json', 'sql', 'mermaid'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
