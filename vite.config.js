import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { siteNavigation, projectNavigation } from './src/site-layout.js';

const pages = ['index', 'schatzkistevr', 'typespace', 'lessonflow', 'about', 'playground'];

export default defineConfig({
  plugins: [{
    name: 'shared-site-layout',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const page = context.filename.split(/[\\/]/).pop().replace('.html', '');
        return html
          .replace('<!-- SITE_NAV -->', siteNavigation(page))
          .replace('<!-- PROJECT_NAV -->', projectNavigation(page));
      },
    },
    // Shared markup changes are applied immediately in the dev server too.
    handleHotUpdate({ file, server }) {
      if (file.endsWith('/src/site-layout.js')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  }],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map(page => [
        page,
        fileURLToPath(new URL(`./${page}.html`, import.meta.url)),
      ])),
    },
  },
});
