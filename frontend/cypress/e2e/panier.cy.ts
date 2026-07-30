describe('Panier', () => {
    let users: { validUser: { username: string; password: string } }
    let product: { testProductId: number }

    // Charge les identifiants de connexion et l'identifiant du produit de test
    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
        cy.fixture('product').then((data) => {
            product = data
        })
    })

    // Avant chaque test : connexion et navigation jusqu'à la page d'un produit
    beforeEach(() => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().should('be.visible')
        cy.get('[data-cy="product-link"]').first().click()
    })

    // Un produit disponible doit pouvoir être ajouté au panier,
    it('ajoute un produit disponible au panier', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-stock"]').should('be.visible')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('1')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart').its('response.statusCode').should('eq', 200)
        cy.get('[data-cy="cart-line"]').should('be.visible')
        cy.get('[data-cy="cart-line-quantity"]').should('be.visible')
        cy.get('[data-cy="cart-total"]').should('be.visible')
    })

    // Le stock du produit est relevé avant et après l'ajout au panier,
    it('vérifie que le stock diminue après ajout au panier', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')

        cy.apiRequest('GET', `/products/${product.testProductId}`).then((response) => {
            const stockAvant = response.body.availableStock

            cy.get('[data-cy="detail-product-quantity"]').clear().type('1')
            cy.get('[data-cy="detail-product-add"]').click()
            cy.wait('@addToCart')

            cy.apiRequest('GET', `/products/${product.testProductId}`).then((response2) => {
                const stockApres = response2.body.availableStock
                expect(stockApres).to.be.lessThan(stockAvant)
            })
        })
    })

    // Une quantité largement supérieure au stock disponible est ajoutée volontairement,
    // afin de vérifier que le stock ne descend jamais en dessous de 0
    it('vérifie que le stock ne devient jamais négatif après un ajout excessif', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')

        cy.get('[data-cy="detail-product-quantity"]').clear().type('1000')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart')

        cy.apiRequest('GET', `/products/${product.testProductId}`).then((response) => {
            const stockApres = response.body.availableStock
            expect(stockApres).to.be.at.least(0)
        })
    })

    // Une quantité négative doit être bloquée directement au niveau de l'interface,
    // avant même l'envoi d'une requête au serveur
    it('refuse une quantité négative (-1) — bloqué côté front, aucune requête envoyée', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('-1')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.get('@addToCart.all').should('have.length', 0)
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    // Une quantité de 0 n'a pas de sens métier et ne devrait pas créer de ligne de panier
    it('refuse une quantité de 0', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('0')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart').its('response.statusCode').should('not.eq', 200)
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    // Une quantité supérieure à la limite métier de 20 ne devrait pas être acceptée
    it('refuse une quantité supérieure à 20', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('21')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart').its('response.statusCode').should('not.eq', 200)
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    // Le champ indiquant la disponibilité du produit doit être visible sur la page
    it('vérifie la présence du champ de disponibilité', () => {
        cy.get('[data-cy="detail-product-stock"]').should('be.visible')
    })
})