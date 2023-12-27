const express = require('express');
const router = express.Router();
const passController = require('../controllers/passController');

router.post('/generate-pass', passController.generatePass);

module.exports = router;
