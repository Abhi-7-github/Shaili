const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOutfit,
  getOutfits,
  getOutfitById,
  markOutfitWorn,
} = require('../controllers/outfitController');

router.use(protect);

router.post('/', createOutfit);
router.get('/', getOutfits);
router.get('/:id', getOutfitById);
router.post('/:id/wear', markOutfitWorn);

module.exports = router;
