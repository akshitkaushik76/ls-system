const express  = require('express');
const router = express.Router();
const AuthController  = require('../Controllers/AuthenticateController');
router.route('/addCustomers').post(AuthController.addCustomers);
router.route('/addOwner').post(AuthController.addOwner);
router.route('/loginCustomer').post(AuthController.loginCustomers);
module.exports = router;