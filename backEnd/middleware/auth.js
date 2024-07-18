const jwt = require ('jsonwebtoken');
require('dotenv').config();




module.exports = (req, res, next) => {
    try {

const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI;

console.log('Clé Secrète JWT :', jwtSecret);
console.log('URI MongoDB :', mongoUri);


        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);   
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    }catch(error) {
        res.status(401).json({ error });
    }
}