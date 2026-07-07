/// <reference types="cypress" />

Cypress.Commands.add('login', (username: string, password: string) => {
    cy.get('[data-cy="nav-link-login"]').click()
    cy.get('[data-cy="login-input-username"]').type(username)
    cy.get('[data-cy="login-input-password"]').type(password)
    cy.get('[data-cy="login-submit"]').click()
})

declare global {
    namespace Cypress {
        interface Chainable {
            login(username: string, password: string): Chainable<void>
        }
    }
}