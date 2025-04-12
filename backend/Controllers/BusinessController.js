const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
const Owner = require('../models/OwnerModel');
const Sale = require('../models/Salesmodel');
const getFormattedDateTime = ()=>{
    const now  = new Date();
    const date = now.getDate().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    return `${date}/${month}/${year}  ${hours}:${minutes}`;
}
//---------PRODUCT CONTROLLERS---------------------------//
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
 exports.patchProducts = async(req,res,next)=>{
    try{
        const {ProductName} = req.params;
        const product = await Product.findOne({ProductName});
        console.log(product);
        if(!product) {
            return res.status(404).json({
                status:'unsuccessfull',
                message:'product does not exist'
            })
        }
        let updateQuantity = req.body.Quantity ?? product.Quantity;
        let updateName = req.body.ProductName ?? product.ProductName;
        let UperHeadCost = req.body.perheadCost ?? product.perheadCost;
        let upsellingPrice = req.body.sellingPrice ?? product.sellingPrice;
        const updatedData = {
            ...req.body,
            ProductName:updateName,
            Quantity:updateQuantity,
            unit:product.unit,
            perheadCost:UperHeadCost,
            sellingPrice:upsellingPrice,
            TotalCostSpent:updateQuantity*(product.TotalCostSpent/product.Quantity),
            updatedAt:getFormattedDateTime()
        }
        const updatedProduct = await Product.findOneAndDeleteUpdate(
            {ProductName},
            {$set:updatedData},
            {new:true,runValidators:true}
        )
        res.status(201).json({
            status:'success',
            updatedProduct
        })
    }catch(error) {
        res.status(500).json({
            status:'unsuccessfull',
            error
        })
    }
 }

 //-------------------CREDIT-CONTROLLERS-----------------------------------
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
 exports.patchCredit  = async(req,res,next)=>{
    try{
     const {name,date} = req.params;
     console.log(name,date);
     const existingCredit = await CreditModel.findOne({recipient_name:name,issued:date});
     console.log(existingCredit)
     if(!existingCredit) {
         return res.status(404).json({
             status:'unsuccessful',
             message:'user not found'
         });
     }
      let updatedQuanted = req.body.quantity ?? existingCredit.quantity;
      let updatedProduct = req.body.product ?? existingCredit.product;
      let updatedRecipient = req.body.recipient_name ?? existingCredit.recipient_name;
      const updatedData = {
         ...req.body,
         recipient_name:updatedRecipient,
         product:updatedProduct,
         quantity:updatedQuanted,
         totalCost:updatedQuanted*(existingCredit.totalCost/existingCredit.quantity),
         updatedAt:getFormattedDateTime()
         
      };
      const updatedCredit = await CreditModel.findOneAndUpdate(
         {
             recipient_name:name,issued:date
         },
         {
             $set:updatedData
         },
         {
             new:true,runValidators:true
         }
      );
      res.status(200).json({
         status:'success',
         credit:updatedCredit
      });
    }catch(error) {
     res.status(500).json({
         status:'unsuccessful',
         error:error.message
     })
    }
 }
 exports.deleteCredit = async(req,res,next)=>{
    try{
     const {name,date,time} = req.params;
     console.log(name,date,time);
     const deleteCredit = await CreditModel.findOneAndDelete({recipient_name:name,issued:date,time:time});
     if(!deleteCredit) {
         return res.status(500).json({status:'unsuccess',message:'user not found'});
     }
     res.status(201).json({
         status:'successfull',
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
 //----------------------- CUSTOMERS-CONTROLLERS OWNER-CONTROLLERS -------------------------//
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
exports.patchCustomers = async(req,res,next)=>{
    try{
        const {name} = req.params.name;
        const customer = await Customers.findOne({name});
        console.log(customer)
        if(!customer) {
            return res.status(404).json({
                status:'unsuccessfull',
                message:`customer with ${name} and ${emailid} does not exist`
            })
        }
        let updatename = req.body.name ?? customer.name;
        let updateemail = req.body.emailid ?? customer.emailid;
        const updateData = {
            ...req.body,
            name:updatename,
            emailid:updateemail,
            service:customer.service,
        }
        const updateCustomers = await Customers.findByIdAndUpdate(
            {name},
            {$set:updateData},
            {new:true,runValidators:true}
        )
        res.status(201).json({
            status:'success',
            updateCustomers,
        })
    }catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error,
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
//----------------------------SALES-CONTROLLER----------------------------//
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



exports.patchSales = async(req,res,next)=>{
    try{
        const {name,date} = req.params;
        const updatedData = {...req.body,updatedAt}
        const UpdateSales  = await Sale.findByIdAndUpdate({name,date},{$set:updatedData},{new:true,runValidators:true});
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