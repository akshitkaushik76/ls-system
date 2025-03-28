const mongoose = require('mongoose');
const Customers = require('./Customermodel');
const UnregCustomers = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter the name'],
    },
    issuedat:{
        type:String,
    }
})
const Users = mongoose.model('unregistered-users',UnregCustomers);
module.exports = Users;