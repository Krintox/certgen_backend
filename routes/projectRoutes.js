const express = require('express');
const projectController = require('../controllers/projectController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/create', projectController.createProject);
router.post('/upload-images/:projectId', projectController.uploadImages);
router.post('/upload-image/:projectId', projectController.uploadImage);
// router.post('/upload-excel/:projectId', uploadMiddleware.single('file'), projectController.uploadExcel);
router.get('/', projectController.getProject);
router.get('/:projectId', projectController.getProjectById);
router.get('/user/images', projectController.getUserProjectImages); // New endpoint for getting user's project images
router.get('/image/:imageId', projectController.getImageById); // New endpoint for getting image by ID

module.exports = router;
