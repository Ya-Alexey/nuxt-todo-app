const isDev = import.meta.dev;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        {
          name: 'format-detection',
          content: 'telephone=no, address=no, email=no, date=no',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content',
        },
      ],
      link: [],
    },
  },
  css: ['~/assets/styles/app.scss'],
  features: {
    inlineStyles: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: (content, filepath) => {
            if (filepath.includes('assets/styles')) {
              return content;
            }
            return `@use "~/assets/styles/function.scss" as *; ${content}`;
          },
        },
      },
    },
  },
  typescript: {
    typeCheck: 'build',
  },
  modules: ['nuxt-svg-sprite-icon', '@pinia/nuxt', ...(isDev ? ['@nuxt/eslint', '@nuxtjs/html-validator'] : [])],
  svgSprite: {
    input: './app/assets/sprite/svg',
    output: './app/assets/sprite/gen',
  },
});
