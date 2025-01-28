import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Allows @/ imports
    },
  },
  css: {
    devSourcemap: true, // Enables better debugging for CSS
  },
  build: {
    sourcemap: false, // No sourcemaps for production (change to true for debugging)
    minify: 'terser', // Minifies JS for faster load times
    cssCodeSplit: false, // Ensures CSS is bundled together, preventing missing styles
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-ai': ['openai'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]', // Ensures CSS files are not lost in the build
      },
    },
    chunkSizeWarningLimit: 2000,
    terserOptions: {
      compress: {
        drop_console: true, // Removes console logs in production
        drop_debugger: true, // Removes debugger statements
      },
    },
  },
  server: {
    port: 3001, // Change from 3000 to 3001
    strictPort: true, // Prevents auto-assigning a different port
    open: true, // Auto-opens browser when running `npm run dev`
  },
  preview: {
    port: 5000, // If using `npm run preview`, serve on port 5000
  },
  base: '/', // If deploying to a subfolder, change this (e.g., "/myapp/")
});