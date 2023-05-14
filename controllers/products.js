const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    //umesto celog try/catch bloka i posebnog wrapera dovoljno je samo da uhvatimo/bacimo gresku
    //throw new Error('testing async errors') //ovo je za async errors
    //Error preuzima middleware error-handler
    const products = await Product.find({
        featured: true, // uslov pretrage
        name: 'vase table' //moze biti vise uslova pretrage
    })
    res.status(200).json({ products, nbHits: products.length});
    //res.status(200).json({ msg: 'products testing route'});
}

const getAllProducts = async (req, res) => {
    //throw new Error('testing async errors')//ovo je za async errors
    
    //Pristup ne direktno preko req.query objekta nego preko novog objekta koji kreiramo i unosimo parametre ako 
    //su setovani
    const {featured, company} = req.query;
    const queryObject = {};

    if(featured) {
        queryObject.featured = featured === 'true' ? true : false;
    }
    if(company) {
        queryObject.company = company;
    }

    const products = await Product.find(queryObject)

    //Pretraga preko search parametara ?name=john
    //const products = await Product.find(req.query)
    res.status(200).json({products, nbHits: products.length});
    //res.status(200).json({msg: 'products route'});
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}