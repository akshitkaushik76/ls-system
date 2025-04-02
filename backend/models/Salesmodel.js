const mongoose = require('mongoose');
const salesRecords = mongoose.Schema({
    productname:{
        type:String,
        required:[true,'please enter the product']
    },
    number:{
        type:String,
        required:[true,'please enter the quantity']
    },
    unit:{
        type:String,
        required:[true,'please enter the unit']
    },
    cost:{
        type:Number,
    },
    profit:{
        type:Number
    },
    date:{
        type:String,
        default: function() {
           return new Date().toLocaleDateString('en-GB');
        }
    },
})

const daysale = mongoose.model('sales',salesRecords);
module.exports = daysale;