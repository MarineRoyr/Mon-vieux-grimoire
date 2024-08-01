const Book = require("../models/book");
const fs = require("fs");
const sharp = require("sharp");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  // suppression des ID issus de la requête client
  delete bookObject._id;
  delete bookObject._userId;

  // stockage dans des variables le nom + le format des images en amont et leur emplacement
  const resizedFileName = `resized-${req.file.filename.replace(
    /\.[^.]+$/,
    ""
  )}.webp`;
  const resizedImagePath = `./images/${resizedFileName}`;

  // desactivation du cache de sharp, et chargement de l'image depuis son emplacement temporaire
  sharp.cache(false);
  sharp(req.file.path)
    .resize({ fit: "contain" })
    .toFormat("webp")
    .toFile(resizedImagePath, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erreur lors du redimensionnement de l'image" });
      }

      // suppression de l'image originale
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error(
            "Erreur lors de la suppression du fichier original:",
            unlinkErr
          );
          return res.status(500).json({
            error:
              "Erreur lors de la suppression du fichier original (redimensionné)",
          });
        }

        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get(
            "host"
          )}/images/${resizedFileName}`,
          averageRating: bookObject.ratings[0].grade,
        });
        // enregistrement en base de données
        book
          .save()
          .then(() => {
            res.status(201).json({ message: "Livre enregistré avec succès." });
          })
          .catch((error) => {
            console.error("Erreur lors de l'enregistrement du livre:", error);
            // en cas d'erreur, on supprime quand même le fichier qu'on avait redimensionné
            const filename = resizedFileName;
            fs.unlink(`./images/${filename}`, (deleteErr) => {
              if (deleteErr) {
                console.error(
                  "Erreur lors de la suppression du fichier redimensionné:",
                  deleteErr
                );
              }
            });

            res
              .status(400)
              .json({ error: "Erreur lors de l'enregistrement du livre" });
          });
      });
    });
};

exports.createRating = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    const { userId, rating } = req.body;
    const newRating = rating;
    if (isNaN(newRating)) {
      return res.status(400).json({ message: "La note doit être un nombre !" });
    }
    book.ratings.push({ userId: userId, grade: rating });

    // calcul note moyenne
    const totalRatings = book.ratings.reduce(
      (acc, curr) => acc + curr.grade,
      0
    );
    book.averageRating = totalRatings / book.ratings.length;

    // enregistrement base de données
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBook = (req, res, next) => {
  // condition pour vérifier présence livre
  const bookObject = req.file
    ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
        }`,
    }
    : { ...req.body };
  // Pour la sécurité, suppression userId client
  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      // si la requête fourni un fichier et que l'URL de l'image change
      if (req.file && book.imageUrl) {
        // isolation dans une constante l'ancien nom de l'image et ensuite on le supprime avec fs
        const oldFilename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${oldFilename}`, (unlinkErr) => {
          if (unlinkErr) {
            console.error(
              "Erreur lors de la suppression de l'ancienne image :",
              unlinkErr
            );
          } else {
            console.log("Ancienne image supprimée avec succès");
          }
        });
      }

      if (req.file) {
        const newFileName = `resized-${req.file.filename.replace(
          /\.[^.]+$/,
          ""
        )}.webp`;
        const newImagePath = `./images/${newFileName}`;

        sharp.cache(false);
        sharp(req.file.path)
          .resize({ fit: "contain" })
          .toFormat("webp")
          .toFile(newImagePath)
          .then(() => {
            fs.unlink(req.file.path, (unlinkErr) => {
              if (unlinkErr) {
                console.error(
                  "Erreur lors de la suppression de l'image originale :",
                  unlinkErr
                );
              } else {
                console.log("Image originale supprimée avec succès");
              }
            });
            // mise à jour dans notre objet créé à partir de la requête, de la nouvelle URL image
            bookObject.imageUrl = `${req.protocol}://${req.get(
              "host"
            )}/images/${newFileName}`;
            // mise à jour de notre objet en base de données dans la condition si il y a un fichier
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() =>
                res.status(200).json({ message: "Livre modifié avec succès." })
              )
              .catch((error) => {
                console.error(
                  "Erreur lors de la mise à jour du livre :",
                  error
                );
                res
                  .status(500)
                  .json({ error: "Erreur lors de la mise à jour du livre" });
              });
          })
          .catch((error) => {
            console.error("Erreur lors du traitement de l'image :", error);
            res
              .status(500)
              .json({ error: "Erreur lors du traitement de l'image" });
          });
      } else {
        // mise à jour de notre objet en base de données dans la condition si il n'y a pas de fichier
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() =>
            res.status(200).json({ message: "Livre modifié avec succès." })
          )
          .catch((error) => {
            console.error("Erreur lors de la mise à jour du livre :", error);
            res
              .status(500)
              .json({ error: "Erreur lors de la mise à jour du livre" });
          });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche du livre :", error);
      res.status(500).json({ error: "Erreur lors de la recherche du livre" });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        //Suppression image dans le dossier prévu puis le livre dans la base de données avec fs et la méthode deleteOne
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Erreur lors de la suppression de l image" });
          }
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé." }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.readAllBook = async (req, res, next) => {
  // Dans un try catch, on fait appel à tous les livres de la collection Book de notre base de données
  // et on gère les erreurs potentielles
  try {
    const book = await Book.find();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.readBestRating = async (req, res, next) => {
  // Dans un try catch, on fait appel à tous les livres de la collection Book de notre base de données
  try {
    const books = await Book.find();
    const booksAverageRating = books.sort(
      (a, b) => b.averageRating - a.averageRating
    );
    const bestRating = booksAverageRating.slice(0, 3);
    res.status(200).json(bestRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.readBook = (req, res, next) => {
  try {
    Book.findById(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json(book);
      })
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
