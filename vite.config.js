/** Development and production setup for this static, multi-page website.
 * Start with npm run dev; npm run build creates deployable pages in dist/.
 * Shared navigation is rendered here, so it does not require JavaScript in the browser.
 */
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { siteNavigation, projectNavigation } from './src/site-layout.js';

// PAGE ENTRY POINTS: add the filename (without .html) when creating a new page.
const pages = ['index', 'schatzkistevr', 'typespace', 'lessonflow', 'about', 'playground'];

export default defineConfig({
  // SHARED LAYOUT: replace each page’s insertion comments with complete navigation HTML.
  plugins: [{
    name: 'shared-site-layout',
    transformIndexHtml: {
      // Run before Vite processes image URLs, stylesheets, and module scripts.
      order: 'pre',
      handler(html, context) {
        // Accept both Windows and Unix path separators when identifying the page.
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
  // MULTI-PAGE BUILD: include every listed HTML page, not just index.html.
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map(page => [
        page,
        fileURLToPath(new URL(`./${page}.html`, import.meta.url)),
      ])),
    },
  },
});
