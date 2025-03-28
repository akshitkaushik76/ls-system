const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
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