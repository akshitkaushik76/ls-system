const express = require('express');
const mongoose = require('mongoose');
const BusinessRouter = require('../backend/Routes/BusinessRoutes');
const PORT = 5500;
const app = express();
app.use(express.json());
app.use('/api/buisness-manager',BusinessRouter);
mongoose.connect('mongodb://localhost:27017/buisness-management',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then((conn)=>{
    console.log("database connected successfully",conn);
}).catch((error)=>{
    console.log("unsuccessful connection error",error);
})

app.listen(PORT,()=>console.log("app is running on the port:",PORT));