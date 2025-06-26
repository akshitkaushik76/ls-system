 const Customers = require('./../models/Customermodel');
 const Owner = require('./../models/OwnerModel');
 const customerror = require('./../Utils/Customerror');
 const jwt  = require('jsonwebtoken');
const {getClosestName} = require('./../Utils/Jaro_Winkler');

const asyncerrorhandler = (func)=>{
    return(req,res,next)=>{
        func(req,res,next).catch(error => next(error))
    }
}
const signup_token  = (data) => {
 const token = jwt.sign({id:data._id},process.env.SECRET_STRING,{
    expiresIn:process.env.EXPIRES_IN

})
return token;
}

 exports.addCustomers = asyncerrorhandler(async(req,res,next)=>{
    console.log(req.body);
       const {name} = req.body;
       const closest = await getClosestName(name);
       if(closest) {
        const error = new customerror(`the customer with the name ${name}, exist choose a unique name that will be easy to process even when the user makes a spelling mistake!`,400);
        next(error);   
    }
       else if(!closest) {

        const data = await Customers.create(req.body);
        console.log(data);
        const token = signup_token(data);
        console.log(token)
        res.status(201).json({
            status:'success',
            TOKEN:token,
            data,
        })
    }
    
 })
 exports.addOwner = asyncerrorhandler(async(req,res,next)=>{
     
         const data = await Owner.create(req.body);
         res.status(201).json({
             status:'success',
             data
         })
    
 })

 exports.loginCustomers = asyncerrorhandler(async(req,res,next)=>{
    const {emailid,password} = req.body;
    if(!emailid || !password) {
        const error = new customerror('emailid or password are missing , please specify the fields',400);
        next(error);
    }
    const user = await Customers.findOne({emailid}).select('+password');
    if(!user) {
        const error = new customerror('user not found,please enter a valid email id',404);
        next(error);
    }
    const isMatch = await user.comparePasswordinDb(password,user.password);
    if(!isMatch) {
        const error = new customerror('the password provided is incorrect',400);
        next(error);
    }
    const token = signup_token(user);
    res.status(200).json({
        status:'success',
        TOKEN:token,
    })

 })