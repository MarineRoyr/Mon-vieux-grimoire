const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    try {
        // On stocke dans des variables la clé secrète et l'URI de notre base de données
        // importés de notre fichier .env
        const jwtSecret = process.env.JWT_SECRET;
        const mongoUri = process.env.MONGODB_URI;

        // On récupère le token dans le header de notre authorization
        // On suppose que le header 'Authorization' est de la forme 'Bearer <token>'
        const token = req.headers.authorization.split(" ")[1];
        // On vérifie le token en utilisant la clé secrète pour s'assurer qu'il est valide
        const decodedToken = jwt.verify(token, jwtSecret);
        // Dans une variable, on extrait l'userID du token decodé
        const userId = decodedToken.userId;
        // et on l'ajoute à notre objet req.auth pour l'exporter dans les controllers
        req.auth = {
            userId: userId,
        };
        // Cela permet de passer au middleware ou à la route suivante
        next();
    } catch (error) {
        // On gère les erreurs potentielles
        res.status(401).json({ error });
    }
};
