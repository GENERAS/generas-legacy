import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Aggressive chunking for slow networks
    rollupOptions: {
      output: {
        // Manual chunking to separate heavy dependencies
        manualChunks: {
          // Core vendor chunk - React and router
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          // Supabase in separate chunk
          'vendor-db': ['@supabase/supabase-js'],
          // Icons in separate chunk
          'vendor-icons': ['lucide-react'],
        },
        // Smaller chunk size for slow networks
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/i.test(assetInfo.name)) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Smaller chunk size warning threshold (500KB)
    chunkSizeWarningLimit: 500,
    // Minification settings
    minify: 'esbuild',
    target: 'es2015', // Support older browsers/phones
    cssMinify: true,
    // Generate source maps only in development
    sourcemap: false,
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: ['recharts'], // Exclude heavy unused deps from pre-bundle
  },
})