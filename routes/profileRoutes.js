const express = require('express');
const profileController = require('../controllers/profileController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/create', uploadMiddleware.single('file'), profileController.createProfile);
// Endpoint to get profile based on token
router.get('/', profileController.getProfile);

// Endpoint to get all profile information
router.get('/getAll', profileController.getAllProfileInfo);

module.exports = router;
