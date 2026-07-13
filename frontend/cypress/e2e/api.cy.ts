describe('Tests API', () => {
    let token: string
    let users: { validUser: { username: string; password: string }, invalidUser: { username: string; password: string } }
    let product: { testProductId: number }

    before(() => {
        cy.fixture('users').then((data) => {
            users = data
        }).then(() => {
            return cy.apiRequest('POST', '/login', {
                body: { username: users.validUser.username, password: users.validUser.password }
            })
        }).then((response) => {
            token = response.body.token
        })

        cy.fixture('product').then((data) => {
            product = data
        })
    })

    it('GET /orders sans connexion doit renvoyer 403', () => {
        cy.apiRequest('GET', '/orders').then((response) => {
            expect(response.status).to.eq(403)
        })
    })

    it('POST /login avec identifiants valides renvoie 200', () => {
        cy.apiRequest('POST', '/login', {
            body: { username: users.validUser.username, password: users.validUser.password }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('token')
        })
    })

    it('POST /login avec identifiants invalides renvoie 401', () => {
        cy.apiRequest('POST', '/login', {
            body: { username: users.invalidUser.username, password: users.invalidUser.password }
        }).then((response) => {
            expect(response.status).to.eq(401)
        })
    })

    it('GET /orders connecté renvoie 200', () => {
        cy.apiRequest('GET', '/orders', {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    it('GET /products/{id} renvoie 200 avec les données produit', () => {
        cy.apiRequest('GET', `/products/${product.testProductId}`).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('id')
            expect(response.body).to.have.property('availableStock')
        })
    })

    it('POST /orders/add — anomalie de convention REST (doc et implémentation utilisent PUT)', () => {
        cy.apiRequest('POST', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1 }
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    it('PUT /orders/add avec produit en rupture de stock doit être refusé', () => {
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1000 }
        }).then((response) => {
            expect(response.status).to.not.eq(200)
        })
    })

    it('POST /reviews ajoute un avis avec succès', () => {
        cy.apiRequest('POST', '/reviews', {
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

    it('GET /reviews ne doit pas exposer le mot de passe des utilisateurs', () => {
        cy.apiRequest('GET', '/reviews', {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200)
            const premierAvis = response.body[0]
            expect(premierAvis.author).to.not.have.property('password')
        })
    })
})