const express  = require('express');
const router = express.Router();
const AuthController  = require('../Controllers/AuthenticateController');
router.route('/addCustomers').post(AuthController.addCustomers);
router.route('/addOwner').post(AuthController.addOwner);
router.route('/loginCustomer').post(AuthController.loginCustomers);
router.route('/LoginOwner').post(AuthController.loginOwner);
router.route('/forgotPasswordCustomer').post(AuthController.forgotPasswordCustomer);
router.route('/forgotPasswordOwner').post(AuthController.forgotPasswordOwner);
router.route('/resetPassword1/:token').post(AuthController.resetPasswordCustomer);
router.route('/resetPassword2/:token').post(AuthController.resetPasswordOwner);
router.route('/updatePasswordCustomers').post(AuthController.protectByCustomer,AuthController.updatePasswordCustomer)
router.route('/updatePasswordOwner').post(AuthController.protectByOwner,AuthController.updatePasswordOwner);
module.exports = router;