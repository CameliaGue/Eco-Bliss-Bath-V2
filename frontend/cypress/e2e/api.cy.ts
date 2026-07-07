describe('Tests API', () => {
    let token: string

    before(() => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8081/login',
            body: { username: 'test2@test.fr', password: 'testtest' }
        }).then((response) => {
            token = response.body.token
        })
    })

    // 1. GET /orders sans connexion → doit renvoyer 403 (anomalie : reçoit 401)
    it('GET /orders sans connexion doit renvoyer 403', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/orders',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(403)
        })
    })

    // 2. POST /login utilisateur connu → 200
    it('POST /login avec identifiants valides renvoie 200', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8081/login',
            body: { username: 'test2@test.fr', password: 'testtest' }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('token')
        })
    })

    // 3. POST /login utilisateur inconnu → 401
    it('POST /login avec identifiants invalides renvoie 401', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8081/login',
            body: { username: 'faux@test.fr', password: 'fauxmdp' },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401)
        })
    })

    // 4. GET /orders connecté → 200
    it('GET /orders connecté renvoie 200', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/orders',
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    // 5. GET /products/{id} → 200
    it('GET /products/3 renvoie 200 avec les données produit', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/3'
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('id')
            expect(response.body).to.have.property('availableStock')
        })
    })

    // 6. POST /orders/add → doit fonctionner en POST selon la doc (anomalie : réel en PUT)
    it('POST /orders/add doit renvoyer 200 selon la documentation', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8081/orders/add',
            headers: { Authorization: `Bearer ${token}` },
            body: { product: 3, quantity: 1 },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    // 7. POST /orders/add produit en rupture de stock → doit être refusé
    it('PUT /orders/add avec produit en rupture de stock doit être refusé', () => {
        cy.request({
            method: 'PUT',
            url: 'http://localhost:8081/orders/add',
            headers: { Authorization: `Bearer ${token}` },
            body: { product: 3, quantity: 1000 },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.not.eq(200)
        })
    })

    // 8. POST /reviews → ajouter un avis
    it('POST /reviews ajoute un avis avec succès', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8081/reviews',
            headers: { Authorization: `Bearer ${token}` },
            body: {
                title: 'Test avis automatisé',
                comment: 'Commentaire de test',
                rating: 5
            }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('id')
            expect(response.body).to.have.property('title')
        })
    })

    // 9. GET /reviews ne doit pas exposer le hash du mot de passe (anomalie critique)
    it('GET /reviews ne doit pas exposer le mot de passe des utilisateurs', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/reviews',
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200)
            const premierAvis = response.body[0]
            expect(premierAvis.author).to.not.have.property('password')
        })
    })
})