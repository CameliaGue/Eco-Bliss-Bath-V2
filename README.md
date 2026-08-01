Prérequis
Pour démarrer cet applicatif web vous devez avoir les outils suivants:

* Docker
* NodeJs

Installation et démarrage
Clonez le projet pour le récupérer
git clone https://github.com/CameliaGue/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
Pour démarrer l'API avec sa base de données.
docker compose up -d
L'API est accessible sur http://localhost:8081

Pour démarrer le frontend de l'applicatif
Rendez-vous dans le dossier frontend
cd ./frontend
Installez les dépendances du projet
npm install
Démarrez le serveur frontend
ng serve
Le frontend est accessible sur http://localhost:4200

Comptes de test
Utilisateur valide : test2@test.fr / testtest

Tests automatisés avec Cypress
Prérequis
Assurez-vous que les deux serveurs tournent avant de lancer les tests :

* API sur http://localhost:8081
* Frontend sur http://localhost:4200

Lancer les tests en mode interactif
npx cypress open
Sélectionnez E2E Testing puis choisissez un navigateur (Chrome recommandé).

Lancer les tests en ligne de commande
npx cypress run
Les résultats s'affichent directement dans le terminal.

Structure des tests
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