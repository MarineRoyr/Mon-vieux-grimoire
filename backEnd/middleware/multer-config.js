const multer = require("multer");

// Dictionnaire pour lister les types MIME aux extensions de fichiers
const MIME_TYPES = {
    "images/jpg": "jpg",
    "images/jpeg": "jpeg",
    "images/png": "jpg",
    "image/webp": "webp",
};

// Dans une variable, on configure le stockage de nos fichiers images, utilisé comme un middleware ensuite
const storage = multer.diskStorage({
    // On configure l'emplacement
    destination: (req, file, callback) => {
        callback(null, "./images");
    },
    // On configure le nom du fichier et son extension avec des underscore et la date d'enregistrement
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + "." + extension);
    },
});

module.exports = multer({ storage }).single("image");
