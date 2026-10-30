import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Each project is a standalone HTML page, without a JavaScript router.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        lessonflow: fileURLToPath(new URL('./lessonflow.html', import.meta.url)),
        typespace: fileURLToPath(new URL('./typespace.html', import.meta.url)),
        schatzkistevr: fileURLToPath(new URL('./schatzkistevr.html', import.meta.url)),
      },
    },
  },
});
