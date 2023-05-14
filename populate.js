//Ovde cemo ponovo da prostupimo Mongo bazi pa nam treba .env gde je string konekcija - modul dotenv
require('dotenv').config()

const connectDB = require('./db/connect')
const Product = require('./models/product')

const jsonProducts = require('./products.json')

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        //Dve metode iz Modela - deleteMany() brise sve i create() - moguce je i niz objekata uneti tj dokumenata
        await Product.deleteMany()
        await Product.create(jsonProducts)
        console.log('Success!!!!')
        //izlazak iz procesa
        process.exit(0) //error code 0
    } catch (error) {
        console.log(error)
        process.exit(1) //error code 1
    }
}

start()