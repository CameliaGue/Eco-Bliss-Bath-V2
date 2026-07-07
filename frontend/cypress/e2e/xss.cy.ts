describe('XSS - Espace commentaire', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.login('test2@test.fr', 'testtest')
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
        cy.visit('/reviews')
    })

    it('résiste à une injection XSS dans le titre', () => {
        // Si une faille XSS existe, une popup alert va s'ouvrir → on la détecte
        let xssDetecte = false
        cy.on('window:alert', () => {
            xssDetecte = true
        })

        cy.get('[data-cy="review-input-title"]').type('<script>alert("XSS")</script>')
        cy.get('[data-cy="review-input-comment"]').type('Commentaire normal')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()

        // Vérifier que la page affiche le script comme texte, pas comme code exécuté
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
        cy.get('[data-cy="review-input-comment"]').type('<script>alert("XSS")</script>')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()

        cy.then(() => {
            expect(xssDetecte).to.be.false
        })
    })
})