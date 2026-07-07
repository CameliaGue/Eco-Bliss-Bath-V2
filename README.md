<div align="center">
# OpenClassrooms - Eco-Bliss-Bath
</div>

<p align="center">
<img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
<img src="https://img.shields.io/badge/Symfony-v6.2-blue">
<img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
<img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
<br><br><br>
</p>

# Prérequis
Pour démarrer cet applicatif web vous devez avoir les outils suivants:
- Docker
- NodeJs

# Installation et démarrage
Clonez le projet pour le récupérer
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
Pour démarrer l'API avec sa base de données.
docker compose up -d

# Pour démarrer le frontend de l'applicatif
Rendez-vous dans le dossier frontend
cd ./frontend
Installez les dépendances du projet
npm install
Démarrez le serveur frontend
ng serve
Le frontend est accessible sur http://localhost:4200

# Tests automatisés avec Cypress

## Prérequis
Assurez-vous que les deux serveurs tournent avant de lancer les tests :
- API sur http://localhost:8081
- Frontend sur http://localhost:4200

## Lancer les tests en mode interactif
npx cypress open
Sélectionnez **E2E Testing** puis choisissez un navigateur (Chrome recommandé).

## Lancer les tests en ligne de commande
npx cypress run
Les résultats s'affichent directement dans le terminal.

## Structure des tests
cypress/
e2e/
connexion.cy.ts   → Tests du scénario de connexion
panier.cy.ts      → Tests du scénario panier
xss.cy.ts         → Tests de faille XSS
api/
api.cy.ts       → Tests des endpoints API
smoke/
smoke.cy.ts     → Smoke tests