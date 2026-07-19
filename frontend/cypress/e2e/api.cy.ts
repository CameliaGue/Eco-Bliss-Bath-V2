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
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1 }
        }).then(() => {
            cy.apiRequest('GET', '/orders', {
                headers: { Authorization: `Bearer ${token}` }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('orderLines')
            })
        })
    })

    it('GET /products/{id} renvoie 200 avec les données produit', () => {
        cy.apiRequest('GET', `/products/${product.testProductId}`).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.id).to.eq(product.testProductId)
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

    it('PUT /orders/add avec quantité négative doit être refusé par l\'API elle-même', () => {
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: -1 }
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
            expect(response.body.title).to.eq('Test avis automatisé')
        })
    })

    it('GET /reviews ne doit pas exposer le mot de passe des utilisateurs', () => {
        const titreUnique = `Avis test sécurité ${Date.now()}`

        cy.apiRequest('POST', '/reviews', {
            headers: { Authorization: `Bearer ${token}` },
            body: {
                title: titreUnique,
                comment: 'Vérification exposition password',
                rating: 5
            }
        }).then(() => {
            cy.apiRequest('GET', '/reviews', {
                headers: { Authorization: `Bearer ${token}` }
            }).then((response) => {
                expect(response.status).to.eq(200)
                const avisCree = response.body.find(
                    (avis: any) => avis.title === titreUnique
                )
                expect(avisCree).to.not.be.undefined
                expect(avisCree.author).to.not.have.property('password')
            })
        })
    })

    it('GET /products renvoie 200 avec la liste des produits', () => {
        cy.apiRequest('GET', '/products').then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.be.an('array')
            expect(response.body.length).to.be.greaterThan(0)
        })
    })

    it('GET /products/random renvoie 200 avec 3 produits aléatoires', () => {
        cy.apiRequest('GET', '/products/random').then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.be.an('array')
            expect(response.body.length).to.eq(3)
        })
    })

    it('POST /register crée un nouvel utilisateur avec succès', () => {
        const email = `test.${Date.now()}@test.fr`
        cy.apiRequest('POST', '/register', {
            body: {
                email,
                firstname: 'Test',
                lastname: 'Automatise',
                plainPassword: {
                    first: 'motdepasse123',
                    second: 'motdepasse123'
                }
            }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('id')
            expect(response.body.email).to.eq(email)
        })
    })

    it('GET /me renvoie les informations de l\'utilisateur connecté', () => {
        cy.apiRequest('GET', '/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('email')
            expect(response.body.email).to.eq(users.validUser.username)
        })
    })

    it('PUT /orders/{id}/change-quantity met à jour la quantité d\'une ligne du panier', () => {
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1 }
        }).then((addResponse) => {
            const ligneAjoutee = addResponse.body.orderLines.find(
                (ligne: any) => ligne.product.id === product.testProductId
            )
            cy.apiRequest('PUT', `/orders/${ligneAjoutee.id}/change-quantity`, {
                headers: { Authorization: `Bearer ${token}` },
                body: { quantity: 2 }
            }).then((response) => {
                expect(response.status).to.eq(200)
                const ligneModifiee = response.body.orderLines.find(
                    (ligne: any) => ligne.id === ligneAjoutee.id
                )
                expect(ligneModifiee.quantity).to.eq(2)
            })
        })
    })

    it('DELETE /orders/{id}/delete supprime une ligne du panier', () => {
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1 }
        }).then((addResponse) => {
            const ligneAjoutee = addResponse.body.orderLines.find(
                (ligne: any) => ligne.product.id === product.testProductId
            )
            cy.apiRequest('DELETE', `/orders/${ligneAjoutee.id}/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then((response) => {
                expect(response.status).to.eq(200)
                const ligneEncorePresente = response.body.orderLines.find(
                    (ligne: any) => ligne.id === ligneAjoutee.id
                )
                expect(ligneEncorePresente).to.be.undefined
            })
        })
    })

    it('POST /orders valide la commande en cours', () => {
        cy.apiRequest('PUT', '/orders/add', {
            headers: { Authorization: `Bearer ${token}` },
            body: { product: product.testProductId, quantity: 1 }
        }).then(() => {
            cy.apiRequest('POST', '/orders', {
                headers: { Authorization: `Bearer ${token}` },
                body: {
                    firstname: 'Test',
                    lastname: 'Automatise',
                    address: '1 rue du Test',
                    zipCode: '75000',
                    city: 'Paris'
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.validated).to.eq(true)
            })
        })
    })
})