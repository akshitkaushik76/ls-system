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
    },
    updatedAt:{
        type:String,
    }

    
})
const Credits = mongoose.model('credit',Creditschema);
module.exports = Credits;

