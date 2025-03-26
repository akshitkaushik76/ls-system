const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
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
        const {product,quantity,unit} = req.body;
        const ProductData = await Product.findOne({ProductName:product});
        console.log(ProductData);
        if(!ProductData) {
            return res.status(404).json({status:'fail',message:'cant find the product'});
        }
        totalCost = 0;
        if(unit =='grams') {
            
        }

    }
    catch(error) {
        res.status(500).json({
            message:'fail',
            error
        })
    }
 }