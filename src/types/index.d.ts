import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts"> & {
  remarkPluginFrontmatter: {
    minutes: number;
  };
};

export interface ThemeConfig {
  site: {
    title: string;
    subtitle: string;
    description: string;
    author: string;
    base: string;
    url: string;
    favicon: string;
  };
  global: {
    lang: string;
    toc: boolean;
    dateFmt: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'MMM D YYYY' | 'D MMM YYYY'
  };
}

export default ThemeConfig;
