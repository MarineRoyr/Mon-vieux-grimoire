
// module qui crée serveur http
const http = require('http');
// application express dans le fichier app
const app = require('./app');
// charge les variables d'environnement
require('dotenv').config();

// fonction qui transforme une valeur en numéro de port valide
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// récupère le port depuis les variables d'environnement ou par défaut le port 4000
const port = normalizePort(process.env.PORT || '4000');
// stocke le port dans l'application express
app.set('port', port);



// fonction qui gère les erreurs du serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    // erreur de type : authentification recquise 
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
      // erreur de type port déjà utilisé
    case 'EADDRINUSE':1
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};


//création du serveur http avec app express comme gestionnaire de requête
const server = http.createServer(app);



// attache le gestionnaire de serveur à la fonction qui gère les erreurs
server.on('error', errorHandler);

//ecouteur du serveur
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});


// demarre le serveur et ecoute sur le port défini
server.listen(port);
