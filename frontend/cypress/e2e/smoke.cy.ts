describe('Smoke Tests', () => {
    let users: { validUser: { username: string; password: string } }

    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
    })

    it('vérifie la présence des champs et boutons de connexion', () => {
        cy.visit('/')
        cy.get('[data-cy="nav-link-login"]').should('be.visible').click()
        cy.get('[data-cy="login-input-username"]').should('be.visible')
        cy.get('[data-cy="login-input-password"]').should('be.visible')
        cy.get('[data-cy="login-submit"]').should('be.visible')
    })

    it('vérifie la présence du bouton d\'ajout au panier quand connecté', () => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')

        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().should('be.visible').click()
        cy.get('[data-cy="detail-product-add"]').should('be.visible')
    })
})