# Back-End Mon Vieux Grimoire

Partie Back-end du projet de site de publication et notation de livres 
Développé en Node.js avec base de donnée MongoDb

## Pour commencer

Effectuer un git clone du projet global ( Back+Front), puis se rendre dans chaqcun de ces deux répertoires pour installer les dépendances nécessaires.
Ci-dessous, vous trouverez les indications pour la partie Backend.

### Pré-requis

Ce qu'il est requis pour commencer avec votre projet...

```
Installer Node.js. v20.15.11 avec npm 
```


### Installation

Les étapes pour installer votre programme....

Etape 1. Dans le répertoire BackEnd, lancer la commande npm install dans le terminal de commande 

```
npm install
```

Etape 2. Vérifier que le fichier package.json a bien été créé avec les dépendances nécessaires ( bcrypt / crypto / dotenv / express / fs / jsonwebtoken / mongoose / mongoose-unique-validator / multer / nodemon / sharp)



Etape 3. Créer un fichier .env dans dossier Backend.
Il devra contenir votre clé secrète dans la variable JWT_SECRET et votre URI MONGODB dans la variable MONGODB_URI

Copiez coller le code ci-dessous dans le fichier .env

```
JWT_SECRET=votre_clé_secrète
MONGODB_URI==mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

Etape 4. Remplacer les variables du fichier .env en générant les éléments nécessaires 

VARIABLE POUR L'URI DE CONNEXION À MONGODB :
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

username: Remplacez ceci par le nom d'utilisateur de votre base de données MongoDB Atlas.
password : Remplacez ceci par le mot de passe de votre base de données MongoDB Atlas.
cluster : Remplacez ceci par le nom de votre cluster MongoDB Atlas.

Lien complet disponible pour connect votre cluster dans votre base de données sur MongoDB

VARIABLE POUR LA CLE SECRETE :
Génerez une clé secrète pour remplacer "votre_clé_secrète"

Utilisez Node.js en copiant collant ces lignes dans votre fichier app.js

```
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('base64');
console.log(secretKey);
```
Et récupérez la clé secrète dans le terminal de commande pour la coller dans votre fichier .env


Puis enregistrez votre fichier .env

## Démarrage

Une fois les 4 étapes de l'installation OK, démarrez votre serveur avec la commande 
```
nodemon server.js
```

Cette commande lance le serveur de l'application, et le redémarre au besoin.

## Fabriqué avec

Node.js 


## Auteur

Marine Royr


