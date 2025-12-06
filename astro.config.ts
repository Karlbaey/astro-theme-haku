// @ts-check
import { defineConfig } from 'astro/config'
import { base, themeConfig } from './src/config'
import { remarkReadingTime } from './src/components/scripts/remark-readingtime.mjs';

import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math'
import remarkMermaid from 'remark-mermaidjs';
import remarkGithubAlerts from 'remark-github-alerts';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

const { url: site } = themeConfig.site

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      remarkGithubAlerts,
      remarkMermaid,
      remarkMath,
    ],

    rehypePlugins: [
      rehypeKatex,
    ],
  },

  integrations: [mdx()],
});