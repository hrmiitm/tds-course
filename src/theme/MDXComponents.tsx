import type { MDXComponents } from 'mdx/types';
import MDXComponentsOriginal from '@theme-original/MDXComponents';
import YouTube from '@site/src/components/mdx/YouTube';
import Video from '@site/src/components/mdx/Video';

const components = {
  ...(MDXComponentsOriginal as MDXComponents),
  YouTube,
  Video,
} satisfies MDXComponents;

export default components;
