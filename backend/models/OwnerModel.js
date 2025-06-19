const mongoose = require('mongoose');
const validator = require('validator');
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
    }
})
const Owner = mongoose.model("Owner",OwnerSchema);
module.exports  = Owner;