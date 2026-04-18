import type { MDXComponents } from 'mdx/types';
import MDXComponentsOriginal from '@theme-original/MDXComponents';
import YouTube from '@site/src/components/mdx/YouTube';
import Video from '@site/src/components/mdx/Video';
import { Step, Steps } from '@site/src/components/mdx/Steps';

const components = {
  ...(MDXComponentsOriginal as MDXComponents),
  YouTube,
  Video,
  Steps,
  Step,
} satisfies MDXComponents;

export default components;
