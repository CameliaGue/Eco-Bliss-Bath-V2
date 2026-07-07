describe('Smoke Tests', () => {

    it('vérifie la présence des champs et boutons de connexion', () => {
        cy.visit('/')

        // Cliquer sur le lien connexion dans la navbar
        cy.get('[data-cy="nav-link-login"]').should('be.visible').click()

        // Vérifier la présence des champs du formulaire
        cy.get('[data-cy="login-input-username"]').should('be.visible')
        cy.get('[data-cy="login-input-password"]').should('be.visible')
        cy.get('[data-cy="login-submit"]').should('be.visible')
    })

    it('vérifie la présence du bouton d\'ajout au panier quand connecté', () => {
        cy.visit('/')
        cy.login('test2@test.fr', 'testtest')
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')

        // Aller sur un produit
        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().should('be.visible').click()

        // Vérifier la présence du bouton ajouter au panier
        cy.get('[data-cy="detail-product-add"]').should('be.visible')
    })

})