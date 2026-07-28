describe('XSS - Espace commentaire', () => {
    let users: { validUser: { username: string; password: string } }

    // Charge les identifiants de connexion nécessaires pour accéder à l'espace commentaire
    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        })
    })

    // Avant chaque test : connexion, puis accès à la page des avis
    beforeEach(() => {
        cy.visit('/')
        cy.login(users.validUser.username, users.validUser.password)
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
        cy.visit('/reviews')
    })

    // Un contenu malveillant est saisi dans le champ titre d'un avis.
    // Une fois l'avis envoyé et affiché, aucune alerte ne doit se déclencher,
    // ce qui prouverait que le contenu est correctement échappé plutôt qu'exécuté
    it('résiste à une injection XSS dans le titre', () => {
        cy.intercept('POST', '**/reviews').as('submitReview')
        let xssDetecte = false
        cy.on('window:alert', () => {
            xssDetecte = true
        })

        cy.get('[data-cy="review-input-title"]').type('<img src=x onerror="alert(\'XSS\')">')
        cy.get('[data-cy="review-input-comment"]').type('Commentaire normal')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()
        cy.wait('@submitReview').its('response.statusCode').should('eq', 200)

        cy.contains('Commentaire normal').should('be.visible')

        cy.then(() => {
            expect(xssDetecte).to.be.false
        })
    })

    // Même vérification, avec le contenu malveillant saisi cette fois
    // dans le champ commentaire plutôt que dans le champ titre
    it('résiste à une injection XSS dans le commentaire', () => {
        cy.intercept('POST', '**/reviews').as('submitReview')
        let xssDetecte = false
        cy.on('window:alert', () => {
            xssDetecte = true
        })

        cy.get('[data-cy="review-input-title"]').type('Titre normal')
        cy.get('[data-cy="review-input-comment"]').type('<img src=x onerror="alert(\'XSS\')">')
        cy.get('[data-cy="review-input-rating-images"]').first().click()
        cy.get('[data-cy="review-submit"]').click()
        cy.wait('@submitReview').its('response.statusCode').should('eq', 200)

        cy.contains('Titre normal').should('be.visible')

        cy.then(() => {
            expect(xssDetecte).to.be.false
        })
    })
})