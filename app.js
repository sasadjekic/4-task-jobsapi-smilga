//Za koriscenje ENV varijabli - dotenv modul - objasnjenje u prethodnom projektu - config za process
require('dotenv').config()
//async error - import modula za async wrapper
require('express-async-errors')

const express = require('express');
const app = express();

const connectDB = require('./db/connect')

const productsRouter = require('./routes/products')


//Import handlera
const notFoundMiddleware = require('./middleware/not-found')
const errorMiddleware = require('./middleware/error-handler')

//middleware
app.use(express.json())

//routes
app.get('/', (req, res)=> {
    res.send('<h1>Store API</h1><a href="/api/v1/products">products route</a>')
})

//products route
app.use('/api/v1/products', productsRouter)

//Ovi hendleri idu posle ruta!
app.use(notFoundMiddleware)
app.use(errorMiddleware)

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        //db
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Server is listening port ${port}...`))
    } catch (error) {
        console.log(error);
    }
}

start()