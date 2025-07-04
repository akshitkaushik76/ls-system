 const Customers = require('./../models/Customermodel');
 const Owner = require('./../models/OwnerModel');
 const customerror = require('./../Utils/Customerror');
 const jwt  = require('jsonwebtoken');
 const util = require('util');
const {getClosestName} = require('./../Utils/Jaro_Winkler');
const  transporter  = require('../Utils/email');
const crypto = require('crypto');


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
         const token = signup_token(data);
         res.status(201).json({
             status:'success',
             TOKEN:token,
             data
         })
    
 })
const login = (Model)=>  asyncerrorhandler(async(req,res,next)=>{
    const {emailid,password} = req.body;
    if(!emailid || !password) {
        const error = new customerror('emailid or password are missing , please specify the fields',400);
        next(error);
    }
    const user = await Model.findOne({emailid}).select('+password');
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

              
 exports.loginCustomers = login(Customers);
 
 exports.loginOwner = login(Owner)
              

const protect = (Model)=> asyncerrorhandler(async(req,res,next)=>{
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }
    console.log(token);
    if(!token) {
        const error = new customerror('login to access the resources',401);
        next(error);
    }
    const decodedToken = await util.promisify(jwt.verify)(token,process.env.SECRET_STRING);
    console.log(decodedToken);
    //if the user does not exists//
    const user = await Model.findById(decodedToken.id);
    console.log(user);
    if(!user) {
        const error = new customerror('the user with the token does not exist',401);
        next(error);
    }
    if(await user.isPasswordChanged(decodedToken.iat)) {
        const error = new customerror('the password was changed recently please login again',401);
        next(error);
    } 
    req.user = user;
    next();
 })
const forgotPassword = (Model)=>asyncerrorhandler(async(req,res,next)=>{
    console.log(req.body);
    let route_path = " ";
    if(Model === Customers) {
        route_path = "resetPassword1";
    }
    else {
        route_path = "resetPassword2";
    }
    console.log(route_path);
    const user = await Model.findOne({emailid:req.body.emailid});
    if(!user) {
        const error = new customerror('the user with the provided email does not exits',404);
        next(error);
    }
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/buisness-manager/${route_path}/${resetToken}`;
    try{
          await transporter.sendMail({
                    from:process.env.email_user,
                    to:req.body.emailid,
                    subject:'PASSWORD RESET MESSAGE',
                    text:`dear user!! according to the query raised we are issuing you the reset password link \n\n ${resetUrl} \n\n The URL is valid for 10 mins ! thank you`
    })
      res.status(200).json({
        status:'success',
        message:'the email was sent successfully'
      })
    } catch(error) {
        user.passwordResetToken  = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave:false});
        return next(new customerror('there was an error sending the email,please try again later',500));
    }
 })
const resetPassword = (model)=> asyncerrorhandler(async(req,res,next)=>{
   
    const decodedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await model.findOne({passwordResetToken:decodedToken,passwordResetTokenExpires:{$gt:Date.now()}});
    if(!user) {
        const error = new customerror('the token is invalid or expired',400);
        next(error);
    }
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    user.save({validateBeforeSave:true});

    const loginToken = signup_token(user);
    res.status(200).json({
        status:'success',
        TOKEN:loginToken
    })

})

 const updatepassword = (model)=> asyncerrorhandler(async(req,res,next)=>{
    const user = await model.findById(req.user._id).select('+password');
    if(!(await user.comparePasswordinDb(req.body.currentPassword,user.password))) {
        const error = new customerror('please enter the correct password',401);
        next(error);
    }
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    await user.save();
    if(user || user.emailid) {
        await transporter.sendMail({
            from:process.env.email_user,
            to:user.emailid,
            subject:'PASSWORD CHANGED INFORMATION',
            text:'dear user ! , your password was changed recently'
        })
    }
    const token = signup_token(user._id);
    res.status(200).json({
        status:'success',
        TOKEN:token,
        message:'password changed successfully!'
    })

 }) 
 exports.updatePasswordCustomer = updatepassword(Customers);
 exports.updatePasswordOwner = updatepassword(Owner);
 exports.resetPasswordCustomer = resetPassword(Customers);
 exports.resetPasswordOwner = resetPassword(Owner);
 exports.forgotPasswordCustomer = forgotPassword(Customers);
 exports.forgotPasswordOwner = forgotPassword(Owner);
 exports.protectByCustomer = protect(Customers);
 exports.protectByOwner = protect(Owner);


 //AUTHENTICATION COMPLETED /////.........  :)
  //                                     