const express = require ('express')
const auth = require('../middleware/auth')
const stuffCtrl = require ('../controllers/stuff')
const multer = require ('../middleware/multer-config')

// Configuration des routes pour la gestion des livres 

const router = express.Router()
router.post('/', auth, multer, stuffCtrl.createBook);
router.post('/:id/rating',auth, stuffCtrl.createRating);
router.put('/:id',auth, multer, stuffCtrl.updateBook)
router.delete('/:id',auth, stuffCtrl.deleteBook)
router.get('/', stuffCtrl.readAllBook);
router.get('/bestrating', stuffCtrl.readBestRating);
router.get('/:id', stuffCtrl.readBook )
 
module.exports = router;