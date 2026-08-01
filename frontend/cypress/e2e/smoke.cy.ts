describe('Smoke Tests', () => {
    let users: { validUser: { username: string; password: string } }

    // Charge les identifiants de connexion nécessaires pour les tests suivants
    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
    })

    // Vérifie que les éléments essentiels du formulaire de connexion sont bien présents
    it('vérifie la présence des champs et boutons de connexion', () => {
        cy.visit('/')
        cy.get('[data-cy="nav-link-login"]').should('be.visible').click()
        cy.get('[data-cy="login-input-username"]').should('be.visible')
        cy.get('[data-cy="login-input-password"]').should('be.visible')
        cy.get('[data-cy="login-submit"]').should('be.visible')
    })

    // Vérifie qu'une fois connecté, le bouton d'ajout au panier est bien présent
    // sur la page d'un produit
    it('vérifie la présence du bouton d\'ajout au panier quand connecté', () => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')

        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().should('be.visible').click()
        cy.get('[data-cy="detail-product-add"]').should('be.visible')
    })

    // Vérifie que le champ de disponibilité du produit est bien présent
    // sur la page d'un produit
    it('vérifie la présence du champ de disponibilité du produit', () => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().click()
        cy.get('[data-cy="detail-product-stock"]').should('be.visible')
    })
})
