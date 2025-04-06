const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
const Owner = require('../models/OwnerModel');
const Sale = require('../models/Salesmodel');
exports.addProduct =  async (req,res,next)=>{
   try{
    const {ProductName} = req.body;
    const {perheadCost} = req.body;
    const {Quantity} = req.body;
    const {sellingPrice} = req.body;
    const {unit} = req.body;
    const TotalCostSpent = perheadCost*Quantity;
    const exist = await Product.findOne({ProductName});
    console.log(exist);
    if(exist) {
       const newQuantity = Quantity+exist.Quantity;
       const newCost = TotalCostSpent+exist.TotalCostSpent;
       console.log("new parameters are:",newQuantity,newCost);
       const updatedata = await Product.findOneAndUpdate({ProductName},{
        Quantity:newQuantity,
        TotalCostSpent:newCost
       },{new:true});
       return res.status(201).json({
        status:'success',
        data:updatedata
       })
    } 
    else{
    const data = await Product.create({
         ProductName,
         Quantity,
         unit,
         perheadCost,
         sellingPrice,
         TotalCostSpent
    })
    return res.status(201).json({
        status:'success',
        data
    })
   }
}
 catch(error) {
    res.status(500).json({
        status:'fail',
        error,
    })
   }
}
exports.getProducts = async(req,res,next)=>{
    try{
        const product = await Product.find();
        res.status(201).json({
            status:'success',
            data:product,
        });
    }catch(error) {
        res.status(500).json({
            error,
        })
    }
 }
 exports.addCredit = async(req,res,next)=>{
    try{
        const {recipient_name,product,quantity} = req.body;
        console.log(product)
        const Prod = await Product.findOne({ProductName:product});
        console.log(Prod);
        if(!Prod) {
            return res.status(404).json({
                status:'fail',
                message:'please enter the product first',
            })
        }

        
        const Sellingprice = Prod.sellingPrice;
        const totalCost = quantity*Sellingprice;
        const data = await CreditModel.create({
            recipient_name,
            product,
            quantity,
            totalCost,
            
        })
        res.status(201).json({
            status:'success',
            data
        })
    }catch(error) {
        res.status(500).json({
            status:'fail',
            error
        })
    } 
 }
 exports.getCredits = async(req,res,next)=>{
    try{
        const data = await CreditModel.find();
        res.status(201).json({
            status:'success',
            data,
        })
    }
    catch(error) {
        res.status(500).json({
            status:'fail',
            error
        })
    }
 }
 exports.addCustomers = async(req,res,next)=>{
    console.log(req.body);
    try{
        const data = await Customers.create(req.body);
        res.status(201).json({
            status:'success',
            data,
        })
    }catch(error) {
        res.status(500).json({
            status:"not successful",
            error,
        })
    }
 }
 exports.getCustomers = async(req,res,next)=>{
   try{
    const data = await Customers.find();
    res.status(201).json({
       status:'success',
       data,
    })
   }catch(error){
     res.status(500).json({
        status:'fail',
        error
     })
   }
}
exports.addOwner = async(req,res,next)=>{
    try{
        const data = await Owner.create(req.body);
        res.status(201).json({
            status:'success',
            data
        })
    }
    catch(error){
        res.status(500).json({
            status:'fail',
            error,
        })
    }
}
exports.getOwner = async(req,res,next)=>{
    try{
        const data = await Owner.find();
        res.status(201).json({
            status:'success',
            data
        })
    }catch(error)  {
        res.status(500).json({
            status:'fail',
            error
        })
    }
}
exports.addSales = async(req,res,next)=>{
   try{
    const {ProductName} = req.body;
    const {number} = req.body;
    console.log("product and quantity is:",ProductName,number);
    const product = await Product.findOne({ProductName});
    console.log(product)
    if(!product) {
        return res.status(404).json({
            status:'fail',
            message:'product not found'
        })
    }
    console.log(product);
    const cost  = product.perheadCost
    const sell = product.sellingPrice
    const profit = (sell-cost)*number;
    const unit = product.unit
    const sales = await Sale.create({
        ProductName,
        number,
        unit,
        sell,
        profit,
    })
    res.status(201).json({
        status:'success',
        sales
    })
   }catch(error) {
    res.status(500).json({
        status:'fail',
        error
    })
   }
}