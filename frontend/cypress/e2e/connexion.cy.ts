describe('Connexion', () => {
  let users: { validUser: { username: string; password: string }, invalidUser: { username: string; password: string } }

  before(() => {
    cy.fixture('users').then((data) => {
      users = data
    })
  })

  it('connecte un utilisateur valide', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login(users.validUser.username, users.validUser.password)
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.get('[data-cy="nav-link-cart"]').should('be.visible')
  })

  it('refuse un utilisateur avec un mauvais mot de passe', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login(users.validUser.username, users.invalidUser.password)
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
    cy.get('[data-cy="login-errors"]').should('be.visible')
  })
})