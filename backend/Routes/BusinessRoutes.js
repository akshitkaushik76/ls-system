const express = require('express');
const Controller1 = require('../Controllers/BusinessController');
const AuthenticateController = require('../Controllers/AuthenticateController');
const router = express.Router();
router.route('/addProducts').post(AuthenticateController.protectByOwner,Controller1.addProduct);
router.route('/getProducts').get(AuthenticateController.protectByCustomer,Controller1.getProducts);
router.route('/CriticalProduct').get(AuthenticateController.protectByOwner,Controller1.getCriticalQuantityProducts);
//router.route('/getClosestProduct/:name').get(Controller1.getClosestProduct);
router.route('/addCredits').post(AuthenticateController.protectByOwner,Controller1.addCredit);
router.route('/getCreditsforOwner/:name').get(AuthenticateController.protectByOwner,Controller1.getCreditsByName);
router.route('/getCreditsforCustomer/:name').get(AuthenticateController.protectByCustomer,Controller1.getCreditsByName);
router.route('/settleCredit').post(AuthenticateController.protectByOwner,Controller1.settleCredit);
router.route('/getCustomers/:name').get(AuthenticateController.protectByOwner,Controller1.getCustomersByname);
//router.route('/addCustomers').post(Controller1.addCustomers);
router.route('/addSales').post(AuthenticateController.protectByOwner,Controller1.addSales);
router.route('/getSaleBydate').get(AuthenticateController.protectByOwner,Controller1.getSaleReportBydate);
router.route('/updateCredit/:name/:date').patch(AuthenticateController.protectByOwner,Controller1.patchCredit);
//router.route('/deleteCredit/:name/:date/:time').delete(Controller1.deleteCredit);
router.route('/updateCustomers/:name/:emailid').patch(AuthenticateController.protectByCustomer,Controller1.patchCustomers);
router.route('/updateProduct/:ProductName').patch(AuthenticateController.protectByOwner,Controller1.patchProducts);

module.exports = router;
//nest js->node js environment//python->flask,django+postgresql->database, bangalore=:>django,fast api
//lot of internship opps
//faster//
//node js has great scalability
//ml , ds-no
//corporate->
//dsa , project->understand,quant and verbal ability//
//you can do m