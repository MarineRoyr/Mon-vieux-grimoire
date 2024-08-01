const express = require("express");
const auth = require("../middleware/auth");
const bookCtrl = require("../controllers/book");
const multer = require("../middleware/multer-config");

// Configuration des routes pour la gestion des livres

const router = express.Router();
router.post("/", auth, multer, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.createRating);
router.put("/:id", auth, multer, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get("/", bookCtrl.readAllBook);
router.get("/bestrating", bookCtrl.readBestRating);
router.get("/:id", bookCtrl.readBook);

module.exports = router;
