const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
const Owner = require('../models/OwnerModel');
const Sale = require('../models/Salesmodel');
exports.addProduct =  async (req,res,next)=>{
    try{
        console.log(req.body);
        const product = await Product.create(req.body);
        res.status(201).json({
            message:'success',
            data:product,
        }) 
    }
    catch(error) {
        res.status(500).json({
            message:'fail',
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
        console.log(req.body);
        const formattedDate = new Date().toLocaleString("en-IN",{timeZone:"Asia/kolkata"})
        const {recipient_name,product,quantity,unit} = req.body;
        const ProductData = await Product.findOne({ProductName:product});
        console.log(ProductData);
        
        if(!ProductData) {
            return res.status(404).json({status:'fail',message:'cant find the product'});
        }
        const customer = await Customers.findOne({name:recipient_name});
        if(!customer) {
            const newunreg = await Unreg.create({
                name:recipient_name,
                issuedat:formattedDate 
            });
            return res.status(201).json({status:"Success",message:"warning! new user found please ask customer to register",data:newunreg});
        } 
        let  totalCost = 0;
        const unitCost = ProductData.perheadCost;
       if(unit === 'pieces' || unit === 'grams') {
         totalCost = quantity*unitCost;
       }
       const newCredit = await CreditModel.create({
         recipient_name,
         product,
         quantity,
         unit,
         totalCost,
         issued:formattedDate
       })
       res.status(201).json({
         status:"success",
         newCredit
       })
     }
    catch(error) {
        res.status(500).json({
            message:'fail',
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
        const Product = await Product.findOne({ProductName})
        console.log(Product);
        const perhead = Product.perheadCost;
        const sellingprice = Product.sellingPrice;
        const cost = perhead*number;
        const sell = number*sellingprice;
        const profit = sell-cost;
        const sale = await Sale.create({
            Productname,
            number,
            unit,
            cost,
            profit,
            date
        })
        res.status(201).json({
            status:'success',
            sale
        })
        
    }
    catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error
        })
    }
}