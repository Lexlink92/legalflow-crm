# LegalFlow CRM

Un CRM moderne spécialement conçu pour les cabinets d'avocats de petite et moyenne taille.

## Fonctionnalités du MVP

- **Profils d'avocats** : Création et gestion de profils personnalisés pour chaque avocat
- **Prise de rendez-vous** : Interface permettant aux clients de prendre rendez-vous en ligne
- **Dépôt de documents** : Les clients peuvent déposer des documents en amont des rendez-vous
- **Espace client** : Accès sécurisé aux documents et communication directe avec l'avocat
- **Gestion documentaire** : Organisation des documents par dossiers et catégories juridiques
- **Modèles de contrats** : Bibliothèque de modèles personnalisables
- **Messagerie intégrée** : Communication directe entre avocat et client
- **Collaboration** : Possibilité de créer des "rooms" de travail avec d'autres cabinets

## Architecture technique

- **Frontend** : React.js, Material-UI, Context API pour la gestion d'état
- **Backend** : Node.js avec Express
- **Base de données** : MongoDB
- **Authentification** : JWT (JSON Web Tokens)
- **Stockage de fichiers** : AWS S3 (simulation dans le MVP)

## Installation et démarrage

### Prérequis
- Node.js (v14+)
- npm ou yarn
- MongoDB (local ou cloud)

### Installation
1. Cloner le dépôt :
```bash
git clone https://github.com/Lexlink92/legalflow-crm.git
cd legalflow-crm
```

2. Installer les dépendances du frontend :
```bash
cd client
npm install
```

3. Installer les dépendances du backend :
```bash
cd ../server
npm install
```

4. Configurer les variables d'environnement :
Créer un fichier `.env` dans le dossier `server` avec le contenu suivant :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/legalflow
JWT_SECRET=votre_secret_jwt
```

5. Démarrer l'application en mode développement :
```bash
# Dans le dossier server
npm run dev
```

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

MIT
