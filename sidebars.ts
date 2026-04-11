import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    { type: 'category', label: 'Chapter 1 — MLOps Foundations', collapsible: true, collapsed: false, link: { type: 'doc', id: 'chapter-1/index' }, items: ['chapter-1/overview', 'chapter-1/environment-setup', 'chapter-1/first-pipeline'] },
    { type: 'category', label: 'Chapter 2 — DevOps Tooling', collapsible: true, collapsed: true, link: { type: 'doc', id: 'chapter-2/index' }, items: ['chapter-2/git-workflows', 'chapter-2/docker-basics'] },
    { type: 'category', label: 'Chapter 3 — Cloud Platforms', collapsible: true, collapsed: true, link: { type: 'doc', id: 'chapter-3/index' }, items: ['chapter-3/gcp-overview', 'chapter-3/cloud-run-deploy'] },
    { type: 'category', label: 'Labs', collapsible: true, collapsed: true, link: { type: 'doc', id: 'labs/index' }, items: ['labs/lab-01-data-pipeline', 'labs/lab-02-containerisation', 'labs/lab-03-cloud-deploy'] },
    { type: 'category', label: 'Reference', collapsible: true, collapsed: true, items: ['reference/tools-glossary', 'reference/command-cheatsheet'] },
  ],
};
export default sidebars;
