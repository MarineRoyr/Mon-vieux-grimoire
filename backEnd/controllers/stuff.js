
const Book = require ('../models/Book')
const fs = require('fs');
const sharp = require('sharp');


// controller pour créer nouveau livre
exports.createBook = (req, res, next) => {
  // On transforme avec .parse, le corps de la requête client en objet JSON
    const bookObject = JSON.parse(req.body.book);
    // On supprime les ID issus de la requête client car on ne souhaite pas faire confiance aux informations fournies par le client 
    delete bookObject._id;
    delete bookObject._userId;
  
    // On stocke dans des variables le nom+ le format des images en amont et leur emplacement 
    const resizedFileName = `resized-${req.file.filename.replace(/\.[^.]+$/, '')}.webp`;
    const resizedImagePath = `./images/${resizedFileName}`;

// on désactive le cache de sharp, puis on charge l'image depuis son emplacement temporaire   
    sharp.cache(false);
    sharp(req.file.path)
    //Puis on redimensionne, on convertit et on sauvegarde l'image reçue dans la requête en faisant appel aux variables précedemment préparées
      .resize({ fit: 'contain' })
      .toFormat('webp')
      .toFile(resizedImagePath, (err) => {
        if (err) {
          //Et on gère les erreurs potentielles
          return res.status(500).json({ error: 'Erreur lors du redimensionnement de l\'image' });
        }


  // On utilise ensuite fs pour supprimer l'image originale
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Erreur lors de la suppression du fichier original:', unlinkErr);
            return res.status(500).json({ error: 'Erreur lors de la suppression du fichier original (redimensionné)' });
          }

      // On crée une variable qui stockera notre requête client selon le modèle mongoose Book  
          const book = new Book({
            // avec le spread operator pour récupérer l'ensemble des éléments de la requête, en définissant 
            // l'id selon le middleware auth et non l'id fourni par le client,  l'URL de l'image redimensionnée et la note moyenne.
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFileName}`,
            averageRating: bookObject.ratings[0].grade,
          });
  // On enregistre notre variable dans la base de données, en gérant les potentielles erreurs
          book.save()
            .then(() => {
              res.status(201).json({ message: 'Livre enregistré avec succès.' });
            })
            .catch((error) => {
              console.error('Erreur lors de l\'enregistrement du livre:', error);
  // en cas d'erreur, on supprime quand même le fichier qu'on avait redimensionné
              const filename = resizedFileName;
              fs.unlink(`./images/${filename}`, (deleteErr) => {
                if (deleteErr) {
                  console.error('Erreur lors de la suppression du fichier redimensionné:', deleteErr);
                }
              });
  
              res.status(400).json({ error: 'Erreur lors de l\'enregistrement du livre' });
            });
        });
      });
  };

  // controller pour créer nouvelle notation
exports.createRating =  async (req, res, next) => {
  // On englobe dans un try catch pour gérer les erreurs 
    try {
      // Dans une variable, on contient le livre que l'on cherche dans la base de donnée à partir de l'id de l'url client
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
// On extrait dans un objet l'user ID et la note de la requête client
        const { userId, rating } = req.body;

        // on stocke dans une variable la note envoyée par la req client et on vérifie qu'il s'agit bien d'un nombre
        const newRating = rating
        if (isNaN(newRating)) {
            return res.status(400).json({ message: 'La note doit être un nombre !' });
        } // on ajoute ensuite cette nouvelle évaluation et l'userID de celui qui l'a postée
        // à notre tableau d'évaluation définit dans notre base de données
        book.ratings.push({userId : userId, grade: rating}); 

        // on calcule ensuite la nouvelle note moyenne ( addition de toutes les notes et division par le nombre total de notes)
        const totalRatings = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
        book.averageRating = totalRatings / book.ratings.length;

        // on enregistre les nouvelles informations dans la base de données
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// controller pour mettre à jour un livre
exports.updateBook = (req, res, next) => {
  // On vérifie la présence ou non d'un fichier dans la requête par une condition et on met en forme cette requête client 
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
} : { ...req.body }
// Pour la sécurité, on supprime l'user ID fourni par le client de la requête
  delete bookObject._userId;

  // on cherche grâce à l'id fourni dans l'URL client, le bon livre 
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
// on gère les erreurs potentielles
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
// si la requête fourni un fichier et que l'URL de l'image change
      if (req.file && book.imageUrl) {
        // on isole dans une constante l'ancien nom de l'image et ensuite on le supprime avec fs
        const oldFilename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFilename}`, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Erreur lors de la suppression de l\'ancienne image :', unlinkErr);
          } else {
            console.log('Ancienne image supprimée avec succès');
          }
        });
      }
// et si la requête fourni un fichier, on utilise sharp pour le convertir, 
//le renommer et l'enregistrer dans l'emplacement prévu
      if (req.file) {
        const newFileName = `resized-${req.file.filename.replace(/\.[^.]+$/, '')}.webp`;
        const newImagePath = `./images/${newFileName}`;

        sharp.cache(false);
        sharp(req.file.path)
          .resize({ fit: 'contain' })
          .toFormat('webp')
          .toFile(newImagePath)
          .then(() => {
            fs.unlink(req.file.path, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Erreur lors de la suppression de l\'image originale :', unlinkErr);
              } else {
                console.log('Image originale supprimée avec succès');
              }
            });
// Et on met à jour dans notre objet créé à partir de la requête, de la nouvelle URL image
            bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${newFileName}`;
// On met à jour notre objet en base de données dans la condition si il y a un fichier
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Livre modifié avec succès.' }))
              .catch((error) => {
                console.error('Erreur lors de la mise à jour du livre :', error);
                res.status(500).json({ error: 'Erreur lors de la mise à jour du livre' });
              });
          })
          .catch((error) => {
            console.error('Erreur lors du traitement de l\'image :', error);
            res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
          });
      } else {
        // On met à jour notre objet en base de données dans la condition si il n'y a pas de fichier
        Book.updateOne({ _id: req.params.id }, {  ...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({ message: 'Livre modifié avec succès.' }))
          .catch((error) => {
            console.error('Erreur lors de la mise à jour du livre :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du livre' });
          });
      }
    })
    .catch((error) => {
      console.error('Erreur lors de la recherche du livre :', error);
      res.status(500).json({ error: 'Erreur lors de la recherche du livre' });
    });
};

// controller pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  // On cherche le bon livre selon l'id de l'URL client 
  Book.findOne({_id: req.params.id})                      
  .then(book => {
    if(book.userId!= req.auth.userId) {
      res.status(401).json({message: 'Non-autorisé'});
    } else {

      //Suppression image dans le dossier prévu puis le livre dans la base de données avec fs et la méthode deleteOne
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          return res.status(500).json({ error: 'Erreur lors de la suppression de l image' });
        }
        Book.deleteOne({_id: req.params.id})
        .then(() => res.status(200).json({message: 'Livre supprimé.'}))
        .catch(error => res.status(401).json ({ error }));
      });
    }
  })
  .catch(error => res.status(500).json({ error }));
}

// controller pour afficher tous les livres
exports.readAllBook = async (req, res, next) => {
  // Dans un try catch, on fait appel à tous les livres de la collection Book de notre base de données
  // et on gère les erreurs potentielles
    try {
       const book = await Book.find();
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
}

// controller pour les 3 livres les mieux notés
exports.readBestRating = async (req, res, next) => {
    // Dans un try catch, on fait appel à tous les livres de la collection Book de notre base de données
    // on les trie grâce à leur propriété averageRating et on crée un nouveau tableau avec les trois premiers 
  // et on gère les erreurs potentielles
    try {
        const books = await Book.find();
        const booksAverageRating = books.sort((a, b) => b.averageRating - a.averageRating);
        const bestRating = booksAverageRating.slice(0, 3);
        res.status(200).json(bestRating);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// controller pour afficher un seul livre en particulier
exports.readBook = (req, res, next) => {
    // Dans un try catch, on fait appel à un livre selon son id, récupéré de l'URL client,  dans la collection Book de notre base de données
  // et on gère les erreurs potentielles
    Book.findById({ _id : req.params.id})
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}))
}