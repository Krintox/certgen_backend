const express = require('express');
const projectController = require('../controllers/projectController');
const uploadMiddleware = require('../middlewares/uploadMiddleware')
const router = express.Router();

router.post('/create', projectController.createProject);
router.post('/upload-images/:projectId', projectController.uploadImages);
router.post('/upload-image/:projectId', projectController.uploadImage);
// router.post('/upload-excel/:projectId', uploadMiddleware.single('file'), projectController.uploadExcel);
router.get('/', projectController.getProject);
router.get('/:projectId', projectController.getProjectById);

module.exports = router;
