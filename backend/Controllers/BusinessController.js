const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
const Owner = require('../models/OwnerModel');
const Sale = require('../models/Salesmodel');
const transporter = require('../Utils/email');
const getFormattedDateTime = ()=>{
    const now  = new Date();
    const date = now.getDate().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    return `${date}/${month}/${year}  ${hours}:${minutes}`;
}
const NormaliseNames = (productName)=>{
    productName = productName.toLowerCase();
    productName = productName.trim();
    return productName.replace(/\s+/g, ' ');
}
function jaroWinkler(s1,s2) {
 const normalizedS1 = NormaliseNames(s1);
 const normalizedS2 = NormaliseNames(s2);
 const m = matchingCharacters(normalizedS1, normalizedS2);
 if(m == 0) return 0;
 const t = getTranspostitions(normalizedS1,normalizedS2)/2;
 const jaro = (m/normalizedS1.length + m/normalizedS2.length+(m-t)/m)/3;
 let prefix = 0;
 for(let i = 0; i <Math.min(4,normalizedS1.length,normalizedS2.length);i++) {
    if(normalizedS1[i] === normalizedS2[i]) {
        prefix++;
    }
    else break;
 }
 return jaro+(prefix*0.1*(1-jaro));
}

function matchingCharacters(s1,s2) {
    const matchWindow = Math.floor(Math.max(s1.length,s2.length)/2)-1;
    let matches = 0;
    const s2matches = [];
    for(let i = 0;i<s1.length;i++) {
        const start = Math.max(0,i-matchWindow);
        const end = Math.min(i+ matchWindow+1,s2.length);
        for(let j = start;j < end;j++) {
            if(!s2matches[j] && s1[i] === s2[j]) {
                s2matches[j] = true;
                matches++;
                break;
            }
        }
    }
    return matches;
}

function getTranspostitions(s1,s2) {
    const matchWindow = Math.floor(Math.max(s1.length,s2.length)/2)-1;
    const s1Matches = [];
    const s2Matches = [];
    for(let i = 0;i<s1.length;i++) {
        const start = Math.max(0,i-matchWindow);
        const end = Math.min(i + matchWindow+1,s2.length);
        for(let j = start;j<end;j++) {
            if(!s2Matches[j] && s1[i] === s2[j]) {
                s1Matches[i] = s1[i];
                s2Matches[j] = s2[j];
                break;
            }
        }
    }
    let k = 0,transpositions = 0;
    for(let i = 0;i<s1Matches.length;i++) {
        if(s1Matches[i]) {
            while(!s2Matches[k]) k++;
            if(s1Matches[i] !== s2Matches[k]) transpositions++;
            k++
        }
    }
    return transpositions;
}
async function getClosestName(Name) {
    let name = await Customers.find({},'name emailid');
    let bestScore = 0;
    let real;
    for(const nm of name) {
        const s1  = NormaliseNames(Name);
        const s2  = NormaliseNames(nm.name);
        const score = jaroWinkler(s1,s2);
        if(score > bestScore) {
            bestScore = score;
            real = nm;
        }
    }
    console.log(real);
    if(bestScore > 0.8)  return real;
    else{
        return res.status(404).json({
            status:'fail',
            message:`no match found for ${name}`
        })
    }
}
async function getClosestProduct(inputProduct) {
    const ProductsinDb  = await Product.find({},'ProductName perheadCost sellingPrice');
    let bestScore = 0;
    
    let real;
    for(const prod of ProductsinDb) {
        const s1 = NormaliseNames(inputProduct);
        const s2 = NormaliseNames(prod.ProductName);
        const score = jaroWinkler(s1,s2);
        if(score > bestScore) {
            bestScore = score;
          
            real = prod;
        } 
    }
    console.log(real);
    if(bestScore > 0.8) return real;
    else{
        return res.status(404).json({
            status:'fail',
            message:`no match found for ${inputProduct}`
        })
    }
}
async function getTotalCredits(email) {
    const name = await Customers.findOne({emailid:email});
    if(!name) {
        return res.status(404).json({
            status:'fail',
            message:'customer not found'
        })
    }
    const result  =  await CreditModel.aggregate([
        {$match:{recipient_name:name.name}},
        {$group:{
            _id:null,
            totalCredits:{$sum:"$totalCost"},
            totalTransactions:{$sum:1}
        }},
        { $project:{
            _id:0,
            totalCredits:1,
            totalTransactions:1,
            
        }}
         
    ])
  return result[0];
}
//---------PRODUCT CONTROLLERS---------------------------//
exports.addProduct =  async (req,res,next)=>{
   try{
    const {ProductName} = req.body;
    const {perheadCost} = req.body;
    const {Quantity} = req.body;
    const {sellingPrice} = req.body;
    const {unit} = req.body;
    const TotalCostSpent = perheadCost*Quantity;
    const exist = await Product.findOne({ProductName});
    console.log(exist);
    if(exist) {
       const newQuantity = Quantity+exist.Quantity;
       const newCost = TotalCostSpent+exist.TotalCostSpent;
       console.log("new parameters are:",newQuantity,newCost);
       const updatedata = await Product.findOneAndUpdate({ProductName},{
        Quantity:newQuantity,
        TotalCostSpent:newCost
       },{new:true});
       return res.status(201).json({
        status:'success',
        data:updatedata
       })
    } 
    else{
    const data = await Product.create({
         ProductName,
         Quantity,
         unit,
         perheadCost,
         sellingPrice,
         TotalCostSpent
    })
    return res.status(201).json({
        status:'success',
        data
    })
   }
}
 catch(error) {
    res.status(500).json({
        status:'fail',
        error,
    })
   }
}
// exports.getClosestProduct = async(req,res,next)=> {
//     try{
//         const inputProduct = req.params.name;
//         const Productsindb = await Product.find({},'ProductName perheadCost sellingPrice');
//         let bestScore = 0;
//         let bestMatch = null;
//         let real;
//         for(const prod of Productsindb) {
//             const s1 = NormaliseNames(inputProduct);
//             const s2 = NormaliseNames(prod.ProductName);
//             const score = jaroWinkler(s1,s2);
//             if(score>bestScore) {
//                 bestScore = score;
//                 bestMatch = prod.ProductName;
//                 real = prod;
//             }
//         }
//         console.log(real);
//         const perheadCost = real.perheadCost;
//         if(bestScore < 0.8) {
//             return res.status(404).json({
//                 status:'fail',
//                 message:`no close match found for ${inputProduct}`
//             })
//         }
//         else{
//             return res.status(200).json({
//                 status:'success',
//                 message:`the closest match for ${inputProduct} is ${bestMatch}, perhead cost : ${perheadCost}`,
//                 data:real
//             })
//         }

//     }catch(error) {
//         return res.status(500).json({
//             status:'fail',
//             error:error.message
//         })
//     }
// }

exports.getProducts = async(req,res,next)=>{
    try{
        let product = await Product.find();
        
        res.status(201).json({
            status:'success',
            data:product,
        });
    }catch(error) {
        res.status(500).json({
            error,
        })
    }
 }
 exports.patchProducts = async(req,res,next)=>{
    try{
        const {ProductName} = req.params;
        let product = await Product.findOne({ProductName});
        if(!product) {
            const closest = await getClosestProduct(ProductName);
            if(!closest || !closest.sellingPrice || !closest.perheadCost) {
                return ;
            }
            product = closest;
        }
        console.log(product);
        if(!product) {
            return res.status(404).json({
                status:'unsuccessfull',
                message:'product does not exist'
            })
        }
        let updateQuantity = req.body.Quantity ?? product.Quantity;
        let updateName = req.body.ProductName ?? product.ProductName;
        let UperHeadCost = req.body.perheadCost ?? product.perheadCost;
        let upsellingPrice = req.body.sellingPrice ?? product.sellingPrice;
        const updatedData = {
            ...req.body,
            ProductName:updateName,
            Quantity:updateQuantity,
            unit:product.unit,
            perheadCost:UperHeadCost,
            sellingPrice:upsellingPrice,
            TotalCostSpent:updateQuantity*(product.TotalCostSpent/product.Quantity),
            updatedAt:getFormattedDateTime()
        }
        const updatedProduct = await Product.findOneAndDeleteUpdate(
            {ProductName},
            {$set:updatedData},
            {new:true,runValidators:true}
        )
        res.status(201).json({
            status:'success',
            updatedProduct
        })
    }catch(error) {
        res.status(500).json({
            status:'unsuccessfull',
            error
        })

    }
 }

 //-------------------CREDIT-CONTROLLERS-----------------------------------
 exports.addCredit = async(req,res,next)=>{
    try{
        const {recipient_name,product,quantity} = req.body;
        //console.log(product)
       
        let Prod = await Product.findOne({ProductName:product});
        console.log(Prod);
        if(!Prod) {
            const closestProduct = await getClosestProduct(product);
            if(!closestProduct || !closestProduct.sellingPrice || !closestProduct.perheadCost) {
                return ;
            }
            Prod  = closestProduct;
            console.log("closest product is :", Prod);
        }
        let customer = await Customers.findOne({name:recipient_name});
        if(!customer) {
            const closestCustomer = await getClosestName(recipient_name);
            if(!closestCustomer || !closestCustomer.emailid) {
                return ;
            }
            customer = closestCustomer;
            console.log("closest customer is:",customer);
        }
         console.log(customer.emailid);
         console.log(customer.name);
        
        const Sellingprice = Prod.sellingPrice;
        const totalCost = quantity*Sellingprice;
        const data = await CreditModel.create({
            recipient_name:customer.name,
            product:Prod.ProductName,
            quantity,
            totalCost,
            
        })
        
         const totalCreditsSofar = await getTotalCredits(customer.emailid);
            console.log("total credits so far:",totalCreditsSofar);
        if(customer && customer.emailid) {
            console.log('enters here:', process.env.email_user,process.env.email_password);
            await transporter.sendMail({
                from:process.env.email_user,
                to:customer.emailid,
                subject:'credit added information',
                text:`Dear ${customer.name},\n\n A new credit has been added for your recent purchase:\n ${Prod.ProductName}\n Quantity: ${quantity}\n Total Cost: ${totalCost}\n\n,Total Credits So far: ${totalCreditsSofar.totalCredits}\n\n, Total Transactions:${totalCreditsSofar.totalTransactions} \n\n,${getFormattedDateTime()}, Thank you`
            })
        }
        res.status(201).json({
            status:'success',
            data
        })
    }catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    } 
 }
 exports.getCredits = async(req,res,next)=>{
    try{
        const data = await CreditModel.find();
        
        res.status(201).json({
            status:'success',
            data,
        })
    }
    catch(error) {
        res.status(500).json({
            status:'fail',
            error
        })
    }
 }
 exports.patchCredit  = async(req,res,next)=>{
    try{
     const {name,date} = req.params;
     console.log(name,date);
     const existingCredit = await CreditModel.findOne({recipient_name:name,issued:date});
     console.log(existingCredit)
     if(!existingCredit) {
         return res.status(404).json({
             status:'unsuccessful',
             message:'user not found'
         });
     }
      let updatedQuanted = req.body.quantity ?? existingCredit.quantity;
      let updatedProduct = req.body.product ?? existingCredit.product;
      let updatedRecipient = req.body.recipient_name ?? existingCredit.recipient_name;
      const updatedData = {
         ...req.body,
         recipient_name:updatedRecipient,
         product:updatedProduct,
         quantity:updatedQuanted,
         totalCost:updatedQuanted*(existingCredit.totalCost/existingCredit.quantity),
         updatedAt:getFormattedDateTime()
         
      };
      const updatedCredit = await CreditModel.findOneAndUpdate(
         {
             recipient_name:name,issued:date
         },
         {
             $set:updatedData
         },
         {
             new:true,runValidators:true
         }
      );
      res.status(200).json({
         status:'success',
         credit:updatedCredit
      });
    }catch(error) {
     res.status(500).json({
         status:'unsuccessful',
         error:error.message
     })
    }
 }
 exports.deleteCredit = async(req,res,next)=>{
    try{
     const {name,date,time} = req.params;
     console.log(name,date,time);
     const existingCredit = await CreditModel.findOne({recipient_name:name,issued:date,time:time});
     console.log(existingCredit);
     const deleteCredit = await CreditModel.findOneAndDelete({recipient_name:name,issued:date,time:time});
     if(!deleteCredit) {
         return res.status(500).json({status:'unsuccess',message:'user not found'});
     }
     res.status(201).json({
         status:'successfull',
         message:`the credit of ${name} on ${date} at ${time} has been settled successfully`
     })
     }
     catch(error) {
         res.status(500).json({
             status:'unsuccessful',
             error
         })
     }
 }
 //----------------------- CUSTOMERS-CONTROLLERS OWNER-CONTROLLERS -------------------------//
 exports.addCustomers = async(req,res,next)=>{
    console.log(req.body);
    try{
        const data = await Customers.create(req.body);
        res.status(201).json({
            status:'success',
            data,
        })
    }catch(error) {
        res.status(500).json({
            status:"not successful",
            error,
        })
    }
 }
 exports.getCustomers = async(req,res,next)=>{
   try{
    const data = await Customers.find();
    res.status(201).json({
       status:'success',
       data,
    })
   }catch(error){
     res.status(500).json({
        status:'fail',
        error
     })
   }
}
exports.patchCustomers = async(req,res,next)=>{
    try{
        const {name} = req.params.name;
        const customer = await Customers.findOne({name});
        console.log(customer)
        if(!customer) {
            return res.status(404).json({
                status:'unsuccessfull',
                message:`customer with ${name} and ${emailid} does not exist`
            })
        }
        let updatename = req.body.name ?? customer.name;
        let updateemail = req.body.emailid ?? customer.emailid;
        const updateData = {
            ...req.body,
            name:updatename,
            emailid:updateemail,
            service:customer.service,
        }
        const updateCustomers = await Customers.findByIdAndUpdate(
            {name},
            {$set:updateData},
            {new:true,runValidators:true}
        )
        res.status(201).json({
            status:'success',
            updateCustomers,
        })
    }catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error,
        })
    }
}
exports.addOwner = async(req,res,next)=>{
    try{
        const data = await Owner.create(req.body);
        res.status(201).json({
            status:'success',
            data
        })
    }
    catch(error){
        res.status(500).json({
            status:'fail',
            error,
        })
    }
}
exports.getOwner = async(req,res,next)=>{
    try{
        const data = await Owner.find();
        res.status(201).json({
            status:'success',
            data
        })
    }catch(error)  {
        res.status(500).json({
            status:'fail',
            error
        })
    }
}
//----------------------------SALES-CONTROLLER----------------------------//
exports.addSales = async(req,res,next)=>{
   try{
    const {ProductName} = req.body;
    const {number} = req.body;
    console.log("product and quantity is:",ProductName,number);
    const product = await Product.findOne({ProductName});
    console.log(product)
    if(!product) {
        return res.status(404).json({
            status:'fail',
            message:'product not found'
        })
    }
    console.log(product);
    const cost  = product.perheadCost
    const sell = product.sellingPrice
    const profit = (sell-cost)*number;
    const unit = product.unit
    const sales = await Sale.create({
        ProductName,
        number,
        unit,
        sell,
        profit,
    })
    res.status(201).json({
        status:'success',
        sales
    })
   }catch(error) {
    res.status(500).json({
        status:'fail',
        error
    })
   }
}
exports.getSaleReportBydate = async(req,res,next)=>{
    try{
       const {date} = req.body;
       const result = await Sale.aggregate([
        {$match:{date:date}},
        {$group:{
            _id:null,
            totalProfit:{$sum:"$profit"},
            totalTransactions:{$sum:1}
        }},
        {
            $project:{
                _id:0,
                date:{$literal:date},
                totalProfit:1,
                totalTransactions:1
            }
        }
       ]);
       res.status(200).json({
        status:'success',
        result
       })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            error
        })
    }
}



exports.patchSales = async(req,res,next)=>{
    try{
        const {name,date} = req.params;
        const updatedData = {...req.body,updatedAt}
        const UpdateSales  = await Sale.findByIdAndUpdate({name,date},{$set:updatedData},{new:true,runValidators:true});
        if(!UpdateSales) {
            return res.status(404).json({
                status:'unsuccessful',
                message:'the user does not exist'
            })
        }
        res.status(201).json({
            status:'success',
            UpdatedDate:UpdateSales
        })
    }
    catch(error) {
        res.status(500).json({
            status:'unsuccessful',
            error
        })
    } 
}