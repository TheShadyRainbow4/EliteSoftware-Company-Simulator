import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
<<<<<<< HEAD
<<<<<<< HEAD
          '@': path.resolve(__dirname, 'src'),
=======
          '@': path.resolve(__dirname, '.'),
>>>>>>> origin/fix-workflow-vite-11152625370068992454
=======
          '@': path.resolve(__dirname, 'src'),
>>>>>>> origin/jules/expand-readme-and-refactor-structure-14704666400517355707
        }
      }
    };
});
