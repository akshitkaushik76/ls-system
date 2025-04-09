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
exports.getSaleReportBydate = async(req,res,next)=>{
    try{
       const {date} = req.body;
       const result = await Sale.aggregate([
        {$match:{date:date}},
        {$group:{
            _id:null,
            totalProfit:{$sum:"$profit"},
            totalTransactions:{$sum:1}
        }},
        {
            $project:{
                _id:0,
                date:{$literal:date},
                totalProfit:1,
                totalTransactions:1
            }
        }
       ]);
       res.status(200).json({
        status:'success',
        result
       })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            error
        })
    }
}
exports.getFormattedDateTime = ()=>{
    const now  = new Date();
    const date = now.getDate().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    return `${date}/${month}/${year}  ${hours}:${minutes}`;
}
exports.patchCredit  = async(req,res,next)=>{
    try{
     const updateData = {
        ...req.body,
        updatedAt:this.getFormattedDateTime()
     }
     const updatecredit  = await CreditModel.findByIdAndUpdate({name,date},{$set:req.body},{runValidators:true});
     if(!credit) {
        return res.status(404).json({status:'unsuccessful',message:'user not found'});
     }    
     res.status(201).json({
        status:'success',
        credit
     })
    }
    catch(error) {
        res.status(500).json({
            status:'unsucessful',
            error,
        })
    }
}
exports.deleteCredit = async(req,res,next)=>{
   try{
    const {name,date} = req.params;
    const deleteCredit = await CreditModel.findByIdAndDelete({name,date});
    if(!deleteCredit) {
        return res.status(500).json({status:'unsuccess',message:'user not found'});
    }
    res.status(201).json({
        status:'unsuccessfull',
        message:`the record for ${name} and ${date} is deleted`
    })
    }
    catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error
        })
    }
}
exports.patchSales = async(req,res,next)=>{
    try{
        const {name,date} = req.params;
        const updatedData = {...req.body,updatedAt}
        const UpdateSales  = await Sale.findByIdAndUpdate({name,date});
        if(!UpdateSales) {
            return res.status(404).json({
                status:'unsuccessful',
                message:'the user does not exist'
            })
        }
        res.status(201).json({
            status:'success',
            UpdatedDate:UpdateSales
        })
    }
    catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error
        })
    } 
}