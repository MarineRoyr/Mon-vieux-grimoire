const express = require ('express')
const router = express.Router()

const stuffCtrl = require ('../controllers/stuff')

router.post('/', stuffCtrl.createBook);
router.post('/:id/rating', stuffCtrl.createRating);
router.put('/:id', stuffCtrl.updateBook)
router.delete('/:id', stuffCtrl.deleteBook)
router.get('/', stuffCtrl.readAllBook);
router.get('/bestrating', stuffCtrl.readBestRating);
router.get('/:id', stuffCtrl.readBook )
 
module.exports = router;