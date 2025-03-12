const mongoose = require('mongoose');
const validator = require('validator');
const Customer = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your name']
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
    },
    password:{
        type:String,
        required:[true,'please set the password'],
        minlength:8
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
    }
})
const Customers = mongoose.model("customers",Customer);
module.exports = Customers