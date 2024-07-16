const Book = require ('../models/Book')



exports.createBook = async (req, res, next) => {
    try {
        delete req.body._id;
        const book = new Book({
            ...req.body
        });
       await book.save();
        res.status(201).json({ message: 'Livre enregistré !' });
    } catch (error) {
        res.status(400).json({ error });
    }
   
}

exports.createRating =  async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        const { userId, rating } = req.body;
        book.ratings.push({userId : userId, grade: rating}); 

        const totalRatings = book.ratings.reduce((acc, curr) => acc + curr, 0);
        book.averageRating = totalRatings / book.ratings.length;

        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


exports.updateBook = (req, res, next) => {
    Book.updateOne({ _id : req.params.id}, {...req.body, _id: req.params.id} )
    .then(() => res.status(200).json({message:'Le livre a été modifié'}))
    .catch(error => res.status(400).json({error}))
}


exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id : req.params.id})
    .then(() => res.status(200).json({message:'Le livre a été supprimé'}))
    .catch(error => res.status(400).json({error}))
}

exports.readAllBook = async (req, res, next) => {
    try {
       const book = await Book.find();
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
}


exports.readBestRating = async (req, res, next) => {
    try {
        const books = await Book.find();
        const booksAverageRating = books.sort((a, b) => b.averageRating - a.averageRating);
        const bestRating = booksAverageRating.slice(0, 3);
        res.status(200).json(bestRating);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.readBook = (req, res, next) => {
    Book.findById({ _id : req.params.id})
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}))
}