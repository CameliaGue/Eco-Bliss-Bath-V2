describe('Panier', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.login('test2@test.fr', 'testtest')
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
        cy.visit('/products')
        cy.get('[data-cy="product-link"]').first().should('be.visible')
        cy.get('[data-cy="product-link"]').first().click()
    })

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

    it('vérifie que le stock diminue après ajout au panier', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')

        cy.request('http://localhost:8081/products/3').then((response) => {
            const stockAvant = response.body.availableStock

            cy.get('[data-cy="detail-product-quantity"]').clear().type('1')
            cy.get('[data-cy="detail-product-add"]').click()
            cy.wait('@addToCart')

            cy.request('http://localhost:8081/products/3').then((response2) => {
                const stockApres = response2.body.availableStock
                expect(stockApres).to.be.lessThan(stockAvant)
            })
        })
    })

    it('vérifie que le stock ne devient pas négatif', () => {
        cy.request('http://localhost:8081/products/3').then((response) => {
            const stock = response.body.availableStock
            expect(stock).to.be.greaterThan(-1)
        })
    })

    it('refuse une quantité négative', () => {
        cy.get('[data-cy="detail-product-quantity"]').clear().type('-1')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    it('refuse une quantité supérieure à 20', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('21')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart').its('response.statusCode').should('not.eq', 200)
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    it('vérifie la présence du champ de disponibilité', () => {
        cy.get('[data-cy="detail-product-stock"]').should('be.visible')
    })
})