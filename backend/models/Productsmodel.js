const mongoose = require('mongoose');
const Products = new mongoose.Schema({
    ProductName:{
        type:String,
        required:[true,'please enter the product']
    },
    Quantity:{
        type:Number,
        required:[true,'please enter the total quantity of product']
    },
    unit:{
      type:String,
      enum:['pieces','kilograms'],
      required:[true,'please enter the quantity unit']
    },
    perheadCost:{
        type:Number,
        required:[true,'please enter the per head cost']
    },
    sellingPrice:{
        type:Number,
    },
    TotalCostSpent:{
        
        type:Number,
        required:[true,'please enter the total cost spent to buy the item for buisness']
    },
    updatedAt:{
        type:String
    }
})
const products = mongoose.model('Product',Products);
module.exports = products