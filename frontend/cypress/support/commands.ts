/// <reference types="cypress" />

const API_URL = 'http://localhost:8081'

Cypress.Commands.add('login', (username: string, password: string) => {
    cy.get('[data-cy="nav-link-login"]').click()
    cy.get('[data-cy="login-input-username"]').type(username)
    cy.get('[data-cy="login-input-password"]').type(password)
    cy.get('[data-cy="login-submit"]').click()
})

Cypress.Commands.add('apiRequest', (method: string, path: string, options: Partial<Cypress.RequestOptions> = {}) => {
    return cy.request({
        method,
        url: `${API_URL}${path}`,
        failOnStatusCode: false,
        ...options
    })
})

declare global {
    namespace Cypress {
        interface Chainable {
            login(username: string, password: string): Chainable<void>
            apiRequest(method: string, path: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
        }
    }
}