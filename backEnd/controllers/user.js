const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); 

//INSCRIPTION
exports.signup = (req, res, next) => {
    //Hashage mdp
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User ({
                email: req.body.email,
                password: hash
            });
        user.save()
            .then(() => res.status(201).json ({ message: 'Utilisateur créé'}))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


//LOGIN
exports.login = (req, res, next) => {

    const jwtSecret = process.env.JWT_SECRET;
    const mongoUri = process.env.MONGODB_URI;
    
    console.log('Clé Secrète JWT :', jwtSecret);
    console.log('URI MongoDB :', mongoUri);

    User.findOne({email: req.body.email})
    .then(user =>{
        if(user ===null) {
            res.status(401).json({message: 'Paire identifiant/Mot de passe incorrecte'});
    }else{
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({ message : 'Paire identifiant/mot de passe incorrecte' })
                } else {
                    res.status(200).json ({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            jwtSecret,   //Var d'environnement
                            { expiresIn: '24h'}
                        )
                    });
                }
            })
            .catch(error => {
                res.status(500).json( {error} );
            })
        }
    })
    .catch(error => {
        res.status(500).json( {error});
    })
};