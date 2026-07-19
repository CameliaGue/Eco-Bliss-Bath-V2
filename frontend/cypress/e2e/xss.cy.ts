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