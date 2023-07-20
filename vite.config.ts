import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const generateSourcemapsFlag = env.GENERATE_SOURCEMAPS

  return defineConfig({
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        supported: {
          bigint: true
        }
      }
    },
    plugins: [react(), svgr()],
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      'process.env.NPM_PACKAGE_VERSION': `"${env.npm_package_version}"`
    },
    build: {
      target: ['esnext'],
      chunkSizeWarningLimit: 2048,
      sourcemap: !!generateSourcemapsFlag
    },
    test: {
      globals: true,
      environment: 'happy-dom'
    }
  })
}
