const express = require("express");
const mongoose = require('mongoose');
const Book = require ('./models/Book')


mongoose.connect('mongodb+srv://booksTest:M2sQ6XGrlWCGZVfa@books.gmdewuv.mongodb.net/?retryWrites=true&w=majority&appName=Books',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));



const app = express();


app.use(express.json());


 app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
      });


app.post('/api/books',  async (req, res, next) => {
    try {
        const book = new Book({
            ...req.body
        });
        await book.save();
        res.status(201).json({ message: 'Livre enregistré !' });
    } catch (error) {
        res.status(400).json({ error });
    }
   
});


app.use('/api/books', async (req, res, next) => {

    try {
       const book = await Book.find();
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
});
 
module.exports = app;