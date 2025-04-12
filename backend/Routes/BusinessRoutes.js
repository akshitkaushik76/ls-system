const express = require('express');
const Controller1 = require('../Controllers/BusinessController');
const router = express.Router();
router.route('/addProducts').post(Controller1.addProduct);
router.route('/getProducts').get(Controller1.getProducts);
router.route('/addCredits').post(Controller1.addCredit);
router.route('/getCredits').get(Controller1.getCredits);
router.route('/getCustomers').get(Controller1.getCustomers);
router.route('/addCustomers').post(Controller1.addCustomers);
router.route('/addSales').post(Controller1.addSales);
router.route('/getSaleBydate').get(Controller1.getSaleReportBydate);
router.route('/updateCredit/:name/:date').patch(Controller1.patchCredit);
router.route('/deleteCredit/:name/:date/:time').delete(Controller1.deleteCredit);
module.exports = router;
//nest js->node js environment//python->flask,django+postgresql->database, bangalore=:>django,fast api
//lot of internship opps
//faster//
//node js has great scalability
//ml , ds-no
//corporate->
//dsa , project->understand,quant and verbal ability//
//you can do m