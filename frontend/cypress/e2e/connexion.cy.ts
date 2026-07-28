describe('Connexion', () => {
  let users: { validUser: { username: string; password: string }, invalidUser: { username: string; password: string } }

  // Charge les identifiants de test (utilisateur valide et invalide) avant l'exécution des tests
  before(() => {
    cy.fixture('users').then((data) => {
      users = data
    })
  })

  // Un utilisateur avec des identifiants valides doit pouvoir se connecter
  // et accéder ensuite au lien vers son panier
  it('connecte un utilisateur valide', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login(users.validUser.username, users.validUser.password)
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.get('[data-cy="nav-link-cart"]').should('be.visible')
  })

  // Un mot de passe incorrect doit être refusé, un message d'erreur doit s'afficher,
  // et l'utilisateur ne doit pas être considéré comme connecté
  it('refuse un utilisateur avec un mauvais mot de passe', () => {
    cy.intercept('POST', '**/login').as('loginRequest')
    cy.visit('/')
    cy.login(users.validUser.username, users.invalidUser.password)
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
    cy.get('[data-cy="login-errors"]').should('be.visible')
    cy.get('[data-cy="nav-link-cart"]').should('not.exist')
  })
})