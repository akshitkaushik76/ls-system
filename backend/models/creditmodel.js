const mongoose = require('mongoose');//for products of fixed quantity

const Creditschema = new mongoose.Schema({
    recipient_name:{
        type:String,
        required:[true,'please enter the recipient name']
    },
    product:{
        type:String,
        required:[true,'please enter the product taken '],

    },
    quantity:{
        type:Number,
        required:[true,'please enter the quantity'],
    },

    totalCost:{
        type:Number
    },
    issued:{
        type:String,
        default:function() {
            return new Date().toLocaleDateString('en-GB');
        }
    }
    
})
const Credits = mongoose.model('credit',Creditschema);
module.exports = Credits;

