const express = require('express');
const Product = require('../models/Productsmodel')
const CreditModel = require('../models/creditmodel');
const Customers = require('../models/Customermodel');
const Unreg = require('../models/Unregcustmodel');
const Owner = require('../models/OwnerModel');
const Sale = require('../models/Salesmodel');
const transporter = require('../Utils/email');
const customerror = require('../Utils/Customerror');
const {getClosestName,getClosestProduct} = require('../Utils/Jaro_Winkler');

const asyncerrorhandler = (func)=>{
    return(req,res,next)=>{
        func(req,res,next).catch(error => next(error))
    }
}


const getFormattedDateTime = ()=>{
    const now  = new Date();
    const date = now.getDate().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    return `${date}/${month}/${year}  ${hours}:${minutes}`;
}


const toISODateString = (dateStr) =>{
    const [d,m,y] = dateStr.split('-');
    return `${y}-${m}-${d}`;
}

//----------------------------------------------------------------------------------------------------//


//=======================================================================================================================================================================//

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
exports.addProduct =  asyncerrorhandler(async (req,res,next)=>{
   
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

 
})
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
//--------------------------------------------------------------------------------------------------------------------//
exports.getProducts = asyncerrorhandler(async(req,res,next)=>{
    
        let product = await Product.find();
        
        res.status(201).json({
            status:'success',
            data:product,
        });
   
 })

//--------------------------------------------------------------------------------------------------------------------------------//

 exports.patchProducts = asyncerrorhandler(async(req,res,next)=>{
    
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
           const error = new customerror(`the product with the product name : ${ProductName} is not found`,404);
           next(error);
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
        const updatedProduct = await Product.findOneAndUpdate(
            {ProductName},
            {$set:updatedData},
            {new:true,runValidators:true}
        )
        res.status(201).json({
            status:'success',
            updatedProduct
        })
    
 })

 //-------------------CREDIT-CONTROLLERS-----------------------------------
 exports.addCredit = asyncerrorhandler(async(req,res,next)=>{
    
        const {recipient_name,product,quantity} = req.body;
        //console.log(product)
        console.log(quantity)
        let Prod = await Product.findOne({ProductName:product});
        console.log(Prod);
        if(!Prod) {
            const closestProduct = await getClosestProduct(product);
            if(!closestProduct || !closestProduct.sellingPrice || !closestProduct.perheadCost) {
                const error = new customerror(`the product with the product name : ${product} is not found or Please enter the product`, 404);
                next(error);
            }
            Prod  = closestProduct;
            console.log("closest product is :", Prod);
        }
        console.log(Prod);
        let customer = await Customers.findOne({name:recipient_name});
        if(!customer) {
            const closestCustomer = await getClosestName(recipient_name);
            if(!closestCustomer || !closestCustomer.emailid) {
                const err = new customerror(`the customer with the name : ${recipient_name} is not found`, 404);
                next(err)
            }
            customer = closestCustomer;
            console.log("closest customer is:",customer);
        }
         console.log(customer.emailid);
         console.log(customer.name);
        
        const Sellingprice = Prod.sellingPrice;
        const totalCost = quantity*Sellingprice;
        const remaining = Number(Prod.Quantity)-Number(quantity);
        console.log(remaining);
        const data = await CreditModel.create({
            recipient_name:customer.name,
            product:Prod.ProductName,
            quantity,
            totalCost,
            
        })
        await Product.findOneAndUpdate({ProductName:Prod.ProductName},{$set:{Quantity:remaining}},{new:true});
        
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
    
 })

//-----------------------------------------------------------------------------------------------------------------------------------------------------//

 exports.getCreditsByName = asyncerrorhandler(async(req,res,next)=>{
    
        let name = req.params.name;
        const Record = await Customers.findOne({name});
        if(!Record) {
            const closest = await getClosestName(name);
            if(!closest) {
                const error = new customerror(`the customer with the name : ${name} is not found`,404);
                next(error)
            }
            name = closest.name;
        }
        console.log(name);
        const data = await CreditModel.find({recipient_name:name});
        
        res.status(200).json({
            status:'success',
            data,
        })
    
 })

//------------------------------------------------------------------------------------------------------------------------------------------------------//

 exports.patchCredit  = asyncerrorhandler(async(req,res,next)=>{
    
     const {name,date} = req.params;
     console.log(name,date);
     const customer = await Customers.findOne({name});
     const existingCredit = await CreditModel.findOne({recipient_name:name,issued:date});
     console.log(existingCredit)
     if(!existingCredit) {
        const error = new customerror(`the credit is not found`,404);
        next(error);
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
       if(customer && customer.emailid) {
            console.log('enters here:', process.env.email_user,process.env.email_password);
            await transporter.sendMail({
                from:process.env.email_user,
                to:customer.emailid,
                subject:'credit updated information',
                text:`dear ${customer.name} , the credit for the purchase ${existingCredit.product } ,quantity: ${existingCredit.quantity} has been updated with ${updatedCredit} at time \n\n,${getFormattedDateTime()}, Sorry for inconvinience. Thank you`
            })
        }
      res.status(200).json({
         status:'success',
         credit:updatedCredit
      });
   
 })

//--------------------------------------------------------------------------------------------------------------------------------------------//

 exports.settleCredit = asyncerrorhandler(async(req,res,next)=>{
    
        let {recipient_name,amount} = req.body;
        let customer = await Customers.findOne({name:recipient_name});
        if(!customer) {
            const closest = await getClosestName(recipient_name);
            if(!closest || !closest.emailid) {
                const error = new customerror(`the customer with name ${recipient_name} is not found!`);
                next(error);
            }
            recipient_name = closest.name;
        }
        console.log(recipient_name);
        customer = await Customers.findOne({name:recipient_name});
        console.log(customer);
        let sum = Number(amount);
    
        let credits = await CreditModel.find({recipient_name});
        console.log(credits);
        credits = credits.sort((a,b)=>{
            const dateA = toISODateString(a.issued)+(a.time || '');
            const dateB = toISODateString(b.issued)+(b.time || '');
            return dateA.localeCompare(dateB);
        })
        let response = [];
        for(let credit of credits) {
            if(sum<=0) break;
            if(sum>=credit.totalCost) {
                sum-=credit.totalCost;
                await CreditModel.findByIdAndUpdate(credit._id,{$set:{totalCost:0,status:'paid'}},{new:true,runValidators:true});
                response.push({
                    recipient_name:credit.recipient_name,
                    product:credit.product,
                    quantity:credit.quantity,
                    date:credit.issued,
                    time:credit.time,
                    paytime:getFormattedDateTime(),
                    status:'paid',
                });
            } else {
                await CreditModel.findByIdAndUpdate(credit._id,{
                    totalCost:credit.totalCost-sum,
                    status:'partially paid',
                });
                response.push({
                    recipient_name:credit.recipient_name,
                    product:credit.product,
                    quantity:credit.quantity,
                    date:credit.issued,
                    time:credit.time,
                    paytime:getFormattedDateTime(),
                    status:'partially paid'
                });
                sum = 0;
            }
        }
        
        if(customer && customer.emailid) {
            await transporter.sendMail({
                from:process.env.email_user,
                to:customer.emailid,
                subject:'Credit Settlement Confirmation',
                text:`Dear ${recipient_name},\n\nYour credit settlement is successful and paid at ${getFormattedDateTime()}.\nDetails:\n${response.map(r=> `Product:${r.product}, Quantity:${r.quantity}, Date:${r.date}, Time:${r.time},Status:${r.status}`).join('\n')}`
            });
        }
        res.status(200).json({
            status:'success',
            message:`settlement of ${recipient_name} is successful`,
            details:response
        });

    
 })
 //----------------------- CUSTOMERS-CONTROLLERS OWNER-CONTROLLERS -------------------------//

 exports.getCustomersByname = asyncerrorhandler(async(req,res,next)=>{
   
    let Name = req.params.name;
    let data = await Customers.findOne({name:Name});
    if(!data) {
        const closest = await getClosestName(req.params.name);
        if(!closest) {
            const error = new customerror(`customer with name ${Name} is not found`,404);
            next(error);
        }
        Name = closest.name;
    }
    data  = await Customers.findOne({name:Name});
    res.status(201).json({
       status:'success',
       data,
    })
  
})
exports.patchCustomers = asyncerrorhandler(async(req,res,next)=>{
    
        const {name,emailid} = req.params;
        
        const customer = await Customers.findOne({emailid});
        console.log(customer)
        if(!customer) {
            const error = new customerror(`customer with emailid ${emailid} is not found`, 404);
            next(error);
        }
        let updatename = req.body.name ?? customer.name;
        let updateemail = req.body.emailid ?? customer.emailid;
        let updatedService = req.body.service ?? customer.service;
        
        console.log(updatedService);
        const updateData = {
            ...req.body,
            name:updatename,
            emailid:updateemail,
            service:updatedService,
        }
        //updating changes in the credit model. this should optional , if at the tine of signup the mistake was done by the user, then the user is supposed to not have any credit record
        const creditRecord = await CreditModel.find({recipient_name:customer.name});
        console.log(creditRecord);
        if(creditRecord) {
            await CreditModel.updateMany({recipient_name:customer.name},{$set:{recipient_name:updatename}}, {new:true, runValidators:true})
        }
        const updateCustomers = await Customers.findOneAndUpdate(
            {emailid},
            {$set:updateData},
            {new:true,runValidators:true}
        )
        console.log(updateCustomers);
        //generate an email response highlighting the changes
        let changes = Object.keys(req.body).map(key=> `${key} : ${req.body[key]}`).join('\n');
        if(customer && customer.emailid ) {
            await transporter.sendMail({
                from:process.env.email_user,
                to:customer.emailid,
                subject:'User information updated!!',
                text:`Dear ${updatename},\n\nYour account information was updated  at ${getFormattedDateTime()} to the ${changes}\n\n . If u did'nt initiated these changes, then we are still developing the interface!`
            })
        }
        console.log(updateCustomers);
        res.status(201).json({
            status:'success',
            updateCustomers,
        })
    })



exports.getOwner = asyncerrorhandler(async(req,res,next)=>{
    
        const data = await Owner.find();
        res.status(201).json({
            status:'success',
            data
        })
   
})
//----------------------------SALES-CONTROLLER----------------------------//
exports.getCriticalQuantityProducts = asyncerrorhandler(async(req,res,next)=>{
    
        const product = await Product.find({Quantity:{$lt:10}});
        res.status(200).json({
            status:'success',
            product
        });
    
})
exports.addSales = asyncerrorhandler(async(req,res,next)=>{
   
    const {ProductName} = req.body;
    const {number} = req.body;
    console.log("product and quantity is:",ProductName,number);
    const  product = await Product.findOne({ProductName});
    // console.log(product)
    // if(!product) {
    //     const closest = await getClosestName(ProductName);
    //     if(!closest) {
    //         return ;
    //     }
    //     product = closest;
    // }

    // console.log(product);
    console.log(product)
    const cost  = product.perheadCost
    const sell = product.sellingPrice
    const profit = (sell-cost)*number;
    const unit = product.unit
    const rem = product.Quantity-number;
    const sales = await Sale.create({
        ProductName,
        number,
        unit,
        sell,
        profit,
    })
    await Product.findByIdAndUpdate(product._id,{$set:{Quantity:rem}},{new:true,runValidators:true});
    res.status(201).json({
        status:'success',
        sales
    })
   
})
exports.getSaleReportBydate = asyncerrorhandler(async(req,res,next)=>{
    
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
   
})



exports.patchSales = asyncerrorhandler(async(req,res,next)=>{
    
        const {name,date} = req.params;
        const updatedData = {...req.body,updatedAt}
        const UpdateSales  = await Sale.findByIdAndUpdate({name,date},{$set:updatedData},{new:true,runValidators:true});
        if(!UpdateSales) {
           const error = new customerror(`the sales with ${name} and ${date} is not found`, 404);
           next(error);
        }
        res.status(201).json({
            status:'success',
            UpdatedDate:UpdateSales
        })
   
})


// buisness logic ends todayyyy!!!!!!!!!!!!!