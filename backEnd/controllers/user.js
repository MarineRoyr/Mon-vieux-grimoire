const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); 

//Controller pour la fonction sign up
exports.signup = (req, res, next) => {
    const { password, email } = req.body;


    // Vérification de la validité du mot de passe
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        console.log('Password validation failed');
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères et une majuscule" });
    }

    // Hashage du mot de passe avec bcrypt
    bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({
                email: email,
                password: hash
            });

            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => {
                    console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
                    res.status(400).json({ error, message: "Problème d'enregistrement de l'utilisateur" });
                });
        })
        .catch(error => {
            console.error('Erreur lors du hashage du mot de passe:', error);
            res.status(500).json({ error, message: "Problème à la création du compte utilisateur" });
        });
};

//Controller pour la fonction log in
exports.login = (req, res, next) => {
    // on définit des variables qui stockent le Json Web Token issu de notre fichier .env
    const jwtSecret = process.env.JWT_SECRET;
    
    //On cherche l'utilisateur dans notre base de données et on le compare à la requête client
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user ===null) {
            res.status(401).json({message: 'Identifiant ET/OU Mot de passe incorrect'});
    }else{
         // On compare le mot de passe fourni avec le mot de passe haché en base de données
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({ message : 'Identifiant ET/OU Mot de passe incorrect' })
                } else {
                    // On crée un jeton Json Web Token avec un id, un token et une clé secrète, expirant dans 24H
                    res.status(200).json ({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            jwtSecret,   
                            { expiresIn: '24h'}
                        )
                    });
                }
            })
            .catch(error => {
                res.status(500).json( {error, message : "L'authentification n'a pas pu aboutir"} );
            })
        }
    })
    .catch(error => {
        res.status(500).json( {error, message : "L'authentification n'a pas pu aboutir"});
    })
};