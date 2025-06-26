 const Customers = require('./../models/Customermodel');
 const Owner = require('./../models/OwnerModel');
const {getClosestName} = require('./../Utils/Jaro_Winkler');

const asyncerrorhandler = (func)=>{
    return(req,res,next)=>{
        func(req,res,next).catch(error => next(error))
    }
}

 exports.addCustomers = asyncerrorhandler(async(req,res,next)=>{
    console.log(req.body);
       const {name} = req.body;
       const closest = await getClosestName(name);
       if(closest) {
        const error = new customerror(`the customer with the name ${name}, exist choose a unique name that will be easy to process even when the user makes a spelling mistake!`,400);
        next(error);   
    }
        const data = await Customers.create(req.body);
        res.status(201).json({
            status:'success',
            data,
        })
    
 })
 exports.addOwner = asyncerrorhandler(async(req,res,next)=>{
     
         const data = await Owner.create(req.body);
         res.status(201).json({
             status:'success',
             data
         })
    
 })