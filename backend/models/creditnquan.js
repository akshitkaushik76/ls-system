const mongoose = require('mongoose');//for products of variable quantity
const VariableQuantity = new mongoose.Schema({
    product:{
        type:String,
        required:[true,'please enter the product ']
    },
    quantity:{
      type:Number,
      required:[true,'please enter the quantity in grams']
    }
});
const VariableCredit = mongoose.model('VariableCredit',VariableQuantity);
module.exports = VariableCredit;