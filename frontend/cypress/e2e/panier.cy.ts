describe('Panier', () => {
    let users: { validUser: { username: string; password: string } }
    let product: { testProductId: number }

    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
        cy.fixture('product').then((data) => {
            product = data
        })
    })

    beforeEach(() => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
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

    it('vérifie que le stock ne devient jamais négatif après un ajout excessif', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')

        cy.apiRequest('GET', `/products/${product.testProductId}`).then((response) => {
            const stockActuel = Math.max(response.body.availableStock, 0)
            const quantiteExcessive = stockActuel + 5

            cy.get('[data-cy="detail-product-quantity"]').clear().type(String(quantiteExcessive))
            cy.get('[data-cy="detail-product-add"]').click()
            cy.wait('@addToCart')

            cy.apiRequest('GET', `/products/${product.testProductId}`).then((response2) => {
                const stockApres = response2.body.availableStock
                expect(stockApres).to.be.at.least(0)
            })
        })
    })

    it('refuse une quantité négative (-1)', () => {
        cy.get('[data-cy="detail-product-quantity"]').clear().type('-1')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.get('[data-cy="cart-line"]').should('not.exist')
    })

    it('refuse une quantité de 0', () => {
        cy.intercept('PUT', '**/orders/add').as('addToCart')
        cy.get('[data-cy="detail-product-quantity"]').clear().type('0')
        cy.get('[data-cy="detail-product-add"]').click()
        cy.wait('@addToCart').its('response.statusCode').should('not.eq', 200)
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