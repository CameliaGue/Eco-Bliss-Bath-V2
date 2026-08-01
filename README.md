# Prérequis

Pour démarrer cet applicatif web vous devez avoir les outils suivants:

* Docker
* NodeJs

# Installation et démarrage

Clonez le projet pour le récupérer

```
git clone https://github.com/CameliaGue/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```

Pour démarrer l'API avec sa base de données.

```
docker compose up -d
```

L'API est accessible sur http://localhost:8081

## Pour démarrer le frontend de l'applicatif

Rendez-vous dans le dossier frontend

```
cd ./frontend
```

Installez les dépendances du projet

```
npm install
```

Démarrez le serveur frontend

```
ng serve
```

Le frontend est accessible sur http://localhost:4200

# Comptes de test

Utilisateur valide : test2@test.fr / testtest

# Tests automatisés avec Cypress

## Prérequis

Assurez-vous que les deux serveurs tournent avant de lancer les tests :

* API sur http://localhost:8081
* Frontend sur http://localhost:4200

## Lancer les tests en mode interactif

```
npx cypress open
```

Sélectionnez E2E Testing puis choisissez un navigateur (Chrome recommandé).

## Lancer les tests en ligne de commande

```
npx cypress run
```

Les résultats s'affichent directement dans le terminal.

# Structure des tests

```
cypress/
  e2e/
    connexion.cy.ts → Tests du scénario de connexion
    panier.cy.ts → Tests du scénario panier
    xss.cy.ts → Tests de faille XSS
    api/
      api.cy.ts → Tests des endpoints API
    smoke/
      smoke.cy.ts → Smoke tests
  fixtures/
    users.json → Identifiants de test (valide/invalide)
    product.json → Identifiant du produit de test
  support/
    commands.ts → Commandes personnalisées (login, apiRequest)
```

## Tests rouges connus (known bugs)

Sur les 30 tests automatisés, 7 sont volontairement en échec : ils documentent des anomalies réelles de l'application, détaillées dans le bilan de campagne (Rapport d'incident), et non des erreurs dans les scripts de test.

Ces échecs sont attendus tant que les anomalies correspondantes n'ont pas été corrigées côté back-end :

* panier.cy.ts : vérifie que le stock ne devient jamais négatif après un ajout excessif → échoue (absence de limite de stock)
* panier.cy.ts : refuse une quantité de 0 → échoue (l'API accepte une quantité nulle)
* panier.cy.ts : refuse une quantité supérieure à 20 → échoue (l'API accepte une quantité excessive)
* api.cy.ts : GET /orders sans connexion doit renvoyer 403 → échoue (l'API renvoie 401)
* api.cy.ts : POST /orders/add — anomalie de convention REST → échoue (seule la méthode PUT est implémentée)
* api.cy.ts : PUT /orders/add avec produit en rupture de stock doit être refusé → échoue (absence de limite de stock, confirmée côté API)
* api.cy.ts : GET /reviews ne doit pas exposer le mot de passe des utilisateurs → échoue (mot de passe et sel de hachage exposés)

Dans un pipeline d'intégration continue (CI), ces 7 tests ne doivent pas bloquer un déploiement à eux seuls, tant qu'ils correspondent exactement à la liste ci-dessus. Toute nouvelle anomalie apparaissant en dehors de cette liste doit, en revanche, être traitée comme une véritable régression et bloquer le déploiement.

Une fois une anomalie corrigée côté back-end, le test correspondant doit être relancé : s'il devient vert, il doit être retiré de cette liste et conservé comme test de non-régression pour l'avenir.