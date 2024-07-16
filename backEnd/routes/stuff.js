const express = require ('express')


const stuffCtrl = require ('../controllers/stuff')
const auth = require('../middleware/auth')

const router = express.Router()
router.post('/', auth, stuffCtrl.createBook);
router.post('/:id/rating',auth, stuffCtrl.createRating);
router.put('/:id',auth, stuffCtrl.updateBook)
router.delete('/:id',auth, stuffCtrl.deleteBook)
router.get('/', stuffCtrl.readAllBook);
router.get('/bestrating', stuffCtrl.readBestRating);
router.get('/:id', stuffCtrl.readBook )
 
module.exports = router;