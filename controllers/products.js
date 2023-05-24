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

        //numeric search $lt, gt... naravno opet, properti cija je vrednost objekat
        //po parametru price u bazi
        price: {$gt: 30} // price Greater Then 30 - cena koja je veca od 30

    }).sort('-name -price')
      .select('name price')
      .limit(4)   
      .skip(5)

    res.status(200).json({ products, nbHits: products.length});
    //res.status(200).json({ msg: 'products testing route'});
}

const getAllProducts = async (req, res) => {
    //throw new Error('testing async errors')//ovo je za async errors
    
    //Pristup ne direktno preko req.query objekta nego preko novog objekta koji kreiramo i unosimo parametre ako 
    //su setovani
    //Ovde su sort i fields search parametri kao "usluzni" za sortiranje i selektovanje polja
    const {featured, company, name, sort, fields, numericFilters} = req.query;
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

    if(numericFilters) {
        //prvo postavimo Operater Map za promenu sa regexom - preko objekta i kljuceva
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        //regex sa \b 
        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`

        )
        console.log(filters)
        //Opcije parametara u nizu - prema poljima u Req.query objektu
        const options = ['price', 'rating']
        //Podelimo string u niz stringova i onda iterujemo kroz njega odmah :)
        filters = filters.split(',').forEach((item) => {  // OD "price-$gt-30,rating-$gte-4"
            //destrukturiranje stringa u pojedinacne elemente niza po ES6
            //Dakle odmah ih deklarisemo i dodeljujemo vrednosti sa opet split metodom ali po onom "-"!
            const [field, operater, value] = item.split('-') 
            console.log(field)
            //const operater = item.split('-')[1] - ovo je validno ali...
            //console.log(typeof operater) - string
            //console.log(operater) - $gt 
            //(ovo je isto kao: const arr = item.split('-'); const field = arr[0]...) 
            //DALJE, i ovde vrsimo proveru da li je polje definisano kao i gore
            if(options.includes(field)) {
                //i pravimo objekat u Query objektu jer tako rade numeric operateri - i to izgleda $gt: 30
                queryObject[field] = {[operater]: Number(value)}
                //!!! ovo sa operaterom u [] je verovatno do toga kako ES6 destrukturiranje funkcionise...
            }
        }) //DO { price: { '$gt': 30 }, rating: { '$gte': 4 } }

    }



    console.log(queryObject)
    // { - primer queryObjecta napravljenog na osnovu REQ.QUERY objekta
    //     featured: false,
    //     company: 'ikea',
    //     name: { '$regex': 'a', '$options': 'i' },
    //     price: { '$gt': 30 },
    //     rating: { '$gte': 4 }
    //   }
    let result = Product.find(queryObject)//.sort('price')
    
    //sort
    if(sort) {
        //console.log(sort) - split i join za pravilno formiranje parametara za sortiranje
        //u Postmanu tj url-u - sort=name,-price
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        //ako nije navedeno sortiranje, biramo sortiranje prema vremenu kreiranja kao default
        result = result.sort('createAt')
    }

    //selektovanje polja za prikaz npr u url-u - ?fields=company,rating
    if(fields) {
        const fieldsList = fields.split(',').join(' ')
        result.select(fieldsList)
    }

    //Paginacija - sa limit i skip! - dobra fora... ali ovde bez destrukturiranja iz REQ.PARAMS
    //biranje strane (params u REQ su u stringu)
    const page = Number(req.query.page) || 1 // default prva strana ako nije odredjeno
    const limit = Number(req.query.limit) || 10 //default 10 rezultata ako nije odredjeno
    //a sad glavna fora... prosto a genijalno
    const skip = (page - 1) * limit 
    //u prevodu za prvu stranu preskoci 0, za drugu 1 * limit pa 2 * limit...
    //paginacija... - da nam prvih 10npr ili drugih 10 itd
    result = result.skip(skip).limit(limit) 
    //primer - 23 proiz - 4 strane - 7 7 7 2



    const products = await result;
    //Pretraga preko search parametara ?name=john
    //const products = await Product.find(req.query)
    res.status(200).json({products, nbHits: products.length});
    //res.status(200).json({msg: 'products route'});
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}