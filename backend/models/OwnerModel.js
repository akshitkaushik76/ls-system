const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const OwnerSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:[true,'please enter a unique username'],
        required:[true,'please enter your name to proceed'],
    },
    emailid:{
        type:String,
        required:[true,'please enter your email id'],
        unique:true,
        validate:[validator.isEmail,'please enter a valid email id'],
    },
    buisness:{
        type:String,
        required:[true,'please enter your buisness name']
    },
    password:{
        type:String,
        minlength:8,
        required:[true,'please set a password']
    },
    confirmpassword:{
        type:String,
        required:[true,'please re-enter password to confirm'],
        validate:{
            validator:function(value) {
               return value == this.password;
            },
            message:"your password and confirm password does not match"
        }
    },
    passwordChangedAt:Date
})
OwnerSchema.pre('save',async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
   this.password = await bcrypt.hash(this.password,12);
   this.confirmpassword = undefined;
   next();
})
OwnerSchema.methods.comparePasswordinDb = async function(pswd,pswdDB) {
    return await bcrypt.compare(pswd, pswdDB);
}
OwnerSchema.methods.isPasswordChanged = async function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        console.log('this password changed at',JWTTimestamp);
        
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}
const Owner = mongoose.model("Owner",OwnerSchema);
module.exports  = Owner;