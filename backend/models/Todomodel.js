const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const Todo = new mongoose.Schema({
    phoneno:{
        type:Number,
        required:[true,'please enter the phone number']
    },
    Username:{
        type:String,
        required:[true,'please enter the username']
    },
    password:{
        type:String,
        minlength:8,
        required:[true,'please enter the password']
    },
    confirmpassword:{
        type:String,
        required:[true,'please enter the password again to continue'],
        validate:{
            validator:function(val) {
                return val == this.password;
            },
            message:'password and confirm password did not match'
        }
    }
})
const User = mongoose.model('Todos',Todo);
module.exports = User