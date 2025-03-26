const mongoose = require('mongoose');//for products of fixed quantity

const Creditschema = new mongoose.Schema({
    product:{
        type:String,
        required:[true,'please enter the product taken '],

    },
    quantity:{
        type:Number,
        required:[true,'please enter the quantity'],
    },
    unit:{
        type:String,
        enum:['pieces','grams']
    },
    totalCost:{
        type:Number
    }
})
const Credits = mongoose.model('credit',Creditschema);
module.exports = Credits;

