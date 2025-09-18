<<<<<<< HEAD
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import ReactDOM from 'react-dom/client';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base : '/RETIM/',
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
=======
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import ReactDOM from 'react-dom/client';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base : '/RETIM/',
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
>>>>>>> 79d1d6f8619fa1c54494a9b3e049950eb47c6158
});