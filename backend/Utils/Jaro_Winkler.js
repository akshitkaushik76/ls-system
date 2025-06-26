const Customers = require('./../models/Customermodel');
const Product = require('./../models/Productsmodel');

const NormaliseNames = (productName)=>{
    productName = productName.toLowerCase();
    productName = productName.trim();
    return productName.replace(/\s+/g, ' ');
}

//==================================================================================================================//
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
//==========================================================================================================================================
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
//====================================================================================================================//
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

//---------------------------------------------------------------------------------------------------------------------------------//
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
    if(bestScore > 0.95)  return real;
   else return null;
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------//
async function getClosestProduct(inputProduct) {
    const ProductsinDb  = await Product.find({},'ProductName perheadCost sellingPrice Quantity');
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
    if(bestScore > 0.91) return real;
    else return null;
}
module.exports = {
    getClosestProduct,
    getClosestName
}
