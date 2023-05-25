import { loadEnv } from "vite";
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const generateSourcemapsFlag = env.GENERATE_SOURCEMAPS;
  const isSentryModeEnabled = env.SENTRY_MODE;
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;
  const sentryReleaseName = `${env.npm_package_name.replace('/', '_')}@${env.npm_package_version}`;
  /*
    SENTRY_MODE=true запихнуть в отдельный шаг релиза в гитла
    SENTRY_AUTH_TOKEN нужно добавить в переменные
    добавить автобамп версий
   */
  if (isSentryModeEnabled && !sentryAuthToken) {
    console.error('process.env.SENTRY_AUTH_TOKEN is not provided')
  }

  return defineConfig({
    plugins: [
      react(),
      svgr(),
      (isSentryModeEnabled && sentryAuthToken) && sentryVitePlugin({
        org: "foo-sb",
        project: "jediswap-interface",

        // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
        // and need `project:releases` and `org:read` scopes
        authToken: sentryAuthToken,
        release: {
          name: sentryReleaseName,
        },
        sourcemaps: {
          // Specify the directory containing build artifacts
          assets: "./dist/**",
          // Don't upload the source maps of dependencies
          ignore: ["./node_modules/**"],
        },

        // Helps troubleshooting - set to false to make plugin less noisy
        debug: true,
      }),
    ],
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      'process.env.NPM_PACKAGE_NAME': `"${env.npm_package_name}"`,
      'process.env.NPM_PACKAGE_VERSION': `"${env.npm_package_version}"`,
    },
    build: {
      chunkSizeWarningLimit: 2048,
      sourcemap: !!(generateSourcemapsFlag || isSentryModeEnabled),
    },
    test: {
      globals: true,
      environment: 'happy-dom'
    }
  })
}
