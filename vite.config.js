import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const page = (name) => fileURLToPath(new URL(`./${name}.html`, import.meta.url));

export default defineConfig({
  // Relative base so the build works at a domain root or under
  // https://<user>.github.io/<repo>/ without editing the config.
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: page("index"),
        studio: page("studio"),
        learn: page("learn"),
        reader: page("reader"),
        diagnostic: page("diagnostic"),
        flashcards: page("flashcards"),
        formulas: page("formulas"),
        methods: page("methods"),
        admin: page("admin"),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "MathsFunda — CBSE Class 9",
        short_name: "MathsFunda",
        description:
          "A step-by-step CBSE Class 9 maths course with a flip-book reader, spaced-repetition flashcards and a formula vault.",
        lang: "en",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "any",
        background_color: "#f4f6f8",
        theme_color: "#176b54",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico,webmanifest,woff,woff2,ttf}",
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // This is a multi-page site: every page is precached on its own URL.
        // A navigateFallback would answer reader.html, learn.html and the rest
        // with index.html, which looks like the home page hijacking the route.
        // The plugin injects "index.html" by default, so it must be nulled.
        navigateFallback: null,
        // Lesson URLs carry the chapter in the query string (?ch=...). Ignore
        // query parameters when matching precached pages so the reader,
        // learn and flashcards pages still open offline.
        ignoreURLParametersMatching: [/.*/],
      },
    }),
  ],
});
