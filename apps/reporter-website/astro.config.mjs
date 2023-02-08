import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import turbolinks from '@astrojs/turbolinks';
import alpinejs from "@astrojs/alpinejs";
import image from "@astrojs/image";
import mdx from "@astrojs/mdx";

export default defineConfig({
  outDir: '../../dist/apps/reporter-website',
  integrations: [
    react(),
    svelte(),
    partytown(),
    alpinejs(),
    sitemap(),
    tailwind(),
    turbolinks(),
    image(),
    mdx()
  ],
});
