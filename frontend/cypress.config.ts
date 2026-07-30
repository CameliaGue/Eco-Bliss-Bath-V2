import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:4200/#/',
    setupNodeEvents(on, config) {
    },
  },
});

// Configuration de Cypress pour les tests end-to-end. Définit l'URL de base pour les tests et configure les événements du nœud.