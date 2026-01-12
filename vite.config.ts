import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    // Enable source maps for debugging in production
    sourcemap: false,
    // Improve chunk size warnings threshold
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-state': ['zustand'],
          'vendor-utils': ['axios', 'date-fns', 'clsx'],
          // Feature chunks (lazy loaded)
          'analytics': [
            './src/pages/analytics/RevenueAnalyticsPage',
            './src/pages/analytics/OrdersAnalyticsPage',
            './src/pages/analytics/OperationsAnalyticsPage',
            './src/pages/analytics/FinancialAnalyticsPage',
            './src/pages/analytics/CustomerExperienceAnalyticsPage',
            './src/pages/analytics/FraudAnalyticsPage',
            './src/pages/analytics/TechnicalMetricsPage',
          ],
        },
      },
    },
    // Minification settings
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'zustand', 'axios'],
  },
})
