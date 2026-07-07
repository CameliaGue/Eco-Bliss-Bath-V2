
describe('Connexion', () => {
  it('connecte un utilisateur valide', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login('test2@test.fr', 'testtest')
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.get('[data-cy="nav-link-cart"]').should('be.visible')
  })

  it('refuse un utilisateur avec un mauvais mot de passe', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login('test2@test.fr', 'mauvaismotdepasse')
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
    cy.get('[data-cy="login-errors"]').should('be.visible')
  })
})