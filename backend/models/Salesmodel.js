const mongoose = require('mongoose');
const salesRecords = mongoose.Schema({
    ProductName:{
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
        default:function() {
            const now = new Date();
            const day = now.getDate().toString().padStart(2,'0');
            const month = (now.getMonth()+1).toString().padStart(2,'0');
            const year = now.getFullYear();
            return `${day}-${month}-${year}`;
        }
    },
    time:{
        type:String,
        default:function() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2,'0');
            const minutes = now.getMinutes().toString().padStart(2,'0');
            return `${hours}:${minutes}`
        }
    }
})

const daysale = mongoose.model('sales',salesRecords);
module.exports = daysale;