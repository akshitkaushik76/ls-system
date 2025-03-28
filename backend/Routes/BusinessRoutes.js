const express = require('express');
const Controller1 = require('../Controllers/BusinessController');
const router = express.Router();
router.route('/addProducts').post(Controller1.addProduct);
router.route('/getProducts').get(Controller1.getProducts);
router.route('/addCredits').post(Controller1.addCredit);
router.route('/getCredits').get(Controller1.getCredits);
module.exports = router;
