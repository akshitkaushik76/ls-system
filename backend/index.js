const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/buisness-management',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then((conn)=>{
    console.log("database connected successfully",conn);
}).catch((error)=>{
    console.log("unsuccessful connection error",error);
})
// const buisnesschema = new mongoose.Schema({
//     name:String,
//     owner:String
// });
// const Buisness = mongoose.model("Buisness",buisnesschema);
// const dummydata = [
// {
//     name:"confectionary",
//     owner:"sudha kumari"
// }
// ,
// {
//     name:"Stationary",
//     owner:"sandeep sharma"
// }
// ]
// const insertData = async()=>{
//     try{
//         await Buisness.insertMany(dummydata);
//         console.log("dummy data inserted successfully");
//     } catch(error) {
//         console.error("error has occured",error);
//     }
// }
// insertData();