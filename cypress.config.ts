// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // Tu peux ajouter des listeners d'événements ici si besoin
      return config;
    },
  },
  video: true,
  screenshotOnRunFailure: true,
});



/*╭────────────────────────────────────────────────────────────╮
     │ Config de base  │
     ╰────────────────────────────────────────────────────────────╯ */


// import { defineConfig } from "cypress";

// export default defineConfig({
//   component: {
//     devServer: {
//       framework: "angular",
//       bundler: "webpack",
//     },
//     specPattern: "**/*.cy.ts",
//   },
//   component: {
//     devServer: {
//       framework: "angular",
//       bundler: "webpack",
//     },
//     specPattern: "**/*.cy.ts",
//   },
//   e2e: {
//     baseUrl: 'http://localhost:4200',
//     specPattern: 'cypress/e2e/**/*.cy.ts',
//     supportFile: 'cypress/support/e2e.ts'
//   },
  
// });
