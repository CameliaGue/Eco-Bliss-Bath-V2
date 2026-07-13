describe('XSS - Espace commentaire', () => {
    let users: { validUser: { username: string; password: string } }

    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
    })

    beforeEach(() => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
        cy.visit('/reviews')
    })

    it('résiste à une injection XSS dans le titre', () => {
        let xssDetecte = false
        cy.on('window:alert', () => {
            xssDetecte = true
        })

        cy.get('[data-cy="review-input-title"]').type('<img src=x onerror="alert(\'XSS\')">')
        cy.get('[data-cy="review-input-comment"]').type('Commentaire normal')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()

        cy.then(() => {
            expect(xssDetecte).to.be.false
        })
    })

    it('résiste à une injection XSS dans le commentaire', () => {
        let xssDetecte = false
        cy.on('window:alert', () => {
            xssDetecte = true
        })

        cy.get('[data-cy="review-input-title"]').type('Titre normal')
        cy.get('[data-cy="review-input-comment"]').type('<img src=x onerror="alert(\'XSS\')">')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()

        cy.then(() => {
            expect(xssDetecte).to.be.false
        })
    })
})