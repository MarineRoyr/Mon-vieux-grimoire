const express = require("express");
const stuffRoutes = require ('./routes/stuff')
const usersRoute = require('./routes/user')
const path = require('path');
const dotenv = require('dotenv');

// Importer mongoose
const mongoose = require('mongoose');

// Utiliser les variables d'environnement
const mongodbUri = process.env.MONGODB_URI;

// Gère la connexion à mongoose
mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Initialise l'application Express
const app = express();

// Permet de parser les requêtes contenant du JSON
app.use(express.json()); 


//Définit les en-têtes pour permettre les requêtes CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  // Autorise toutes les origines
        res.setHeader('Access-Control-Allow-Origin', '*');
  // Précise les headers autorisés
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // Précise les requêtes http autorisées
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
      });


  // Définit les routes 
app.use('/api/books', stuffRoutes)
app.use('/api/auth', usersRoute)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app;