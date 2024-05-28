const express = require('express');
const { sendEmails } = require('../controllers/emailController');
const router = express.Router();

router.post('/sendEmails', sendEmails);

module.exports = router;
