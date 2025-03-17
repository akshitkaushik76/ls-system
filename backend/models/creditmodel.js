const mongoose = require('mongoose');//for products of fixed quantity

const Creditschema = new mongoose.Schema({
    product:{
        type:String,
        required:[true,'please enter the product taken '],

    },
    quantity:{
        type:Number,
        required:[true,'please enter the quantity'],
    }
})
const Credits = mongoose.model('credit',Creditschema);
module.exports = Credits;

