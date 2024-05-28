const express = require('express');
const postController = require('../controllers/postController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/create', uploadMiddleware.array('files'), postController.createPost);
router.put('/update/:id', uploadMiddleware.array('files'), postController.updatePost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

module.exports = router;
