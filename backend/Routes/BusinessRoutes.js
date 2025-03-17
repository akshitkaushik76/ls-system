const express = require('express');
const Controller1 = require('../Controllers/BusinessController');
const router = express.Router();
router.route('/addProducts').post(Controller1.addProduct);
module.exports = router;