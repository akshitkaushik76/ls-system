const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt  = require('bcryptjs');
// const jwt = require('jsonwebtokens');
const crypto = require('crypto');
const Customer = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your name'],
        unique:[true,'please enter a unique username']
    },
    emailid:{
        type:String,
        required:[true,'please enter your email id'],
        unique:true,
        validate:[validator.isEmail,'please enter a correct email']
    },
    service:{
        type:String,
        required:[true,'please enter the name of buisness from which you are taking services'],
        unique:[true,'please enter the correct buisname name for registration and login purposes']
    },
    password:{
        type:String,
        required:[true,'please set the password'],
        minlength:8,
        select:false
    },
    confirmpassword:{
        type:String,
        required:[true,'please re-enter the password to confirm'],
        validate:{
            validator:function(value) {
                return value == this.password
            },
            message:"the password and confirm password does not match"
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date

})
Customer.pre('save',async function(next){
    if(!this.isModified('password')) {
        return next();
    }
   this.password = await bcrypt.hash(this.password,12);
   this.confirmpassword = undefined
   next();
})
Customer.methods.comparePasswordinDb = async function(pswd,pswdDB) {
    return await bcrypt.compare(pswd,pswdDB);
}

Customer.methods.isPasswordChanged = async function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        console.log('this password changed at',JWTTimestamp);
        
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}

Customer.methods.createResetPasswordToken = function() {
  const resetToken =  crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10*60*1000;
  console.log(resetToken,this.passwordResetToken);
  return resetToken;
}
const Customers = mongoose.model("customers",Customer);
module.exports = Customers