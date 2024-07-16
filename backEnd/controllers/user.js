
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


exports.signup = ( res, req, next) => {
    bcrypt.hash(req.body.password, 10)
.then(hash => {
    const user = new User(
        {email : req.body.email,
            password : hash
        })
        user.save()
        .then(()=> res.status(201).json ({ message : "l'utilisateur a été créé"}))
        .catch(error => res.status(500..jspn({error})))
})
.catch(error => res.status(500).json({error}))

}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Identifiant OU Mot de passe incorrect'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Identifiant OU Mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({userId: user._id}, 'RANDOM_TOKEN_SECRET', {expiresIn: '24h'})
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };