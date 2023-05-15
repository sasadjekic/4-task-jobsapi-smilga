const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    //umesto celog try/catch bloka i posebnog wrapera dovoljno je samo da uhvatimo/bacimo gresku
    //throw new Error('testing async errors') //ovo je za async errors
    //Error preuzima middleware error-handler
    const search = "ab"
    const products = await Product.find({
        //featured: true, // uslov pretrage
        //name: 'vase table' //moze biti vise uslova pretrage

        //MongoDB query parameters - u Value polju je objekat sa operatorima i opcijama
        //name: {$regex: search, $options: 'i'} //opcija "i" - insensitive
    }).sort('-name -price')
    res.status(200).json({ products, nbHits: products.length});
    //res.status(200).json({ msg: 'products testing route'});
}

const getAllProducts = async (req, res) => {
    //throw new Error('testing async errors')//ovo je za async errors
    
    //Pristup ne direktno preko req.query objekta nego preko novog objekta koji kreiramo i unosimo parametre ako 
    //su setovani
    const {featured, company, name} = req.query;
    const queryObject = {};
    /*Pristup preko parametara idemo preko novog kreiranog objekta u koji ubacujemo query parametre ako ih ima
    U konkretnom slucaju, pokrice samo ono sto hocemo od parametara (bez obzira koliko ih ima u Req.query objektu)
    U jednom slucaju imamo ternary odredjene vrednosti (kanalisemo ih). Ako prodje IF petlje i nista ne prodje
    tj bude queryObject prazan onda vraca SVE kao rezultat*/
    if(featured) {
        queryObject.featured = featured === 'true' ? true : false;
    }
    if(company) {
        queryObject.company = company;
    }
    if(name) {
        //unosimo kao VALUE propertija NAME MongoDB query params u vidu objekta koji ce metod .FIND prepoznati
        queryObject.name = { $regex: name, $options: 'i'};
    }
    console.log(queryObject)
    const products = await Product.find(queryObject)//.sort('price')

    //Pretraga preko search parametara ?name=john
    //const products = await Product.find(req.query)
    res.status(200).json({products, nbHits: products.length});
    //res.status(200).json({msg: 'products route'});
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}