const express = require('express');
const Product = require('../models/Productsmodel')

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