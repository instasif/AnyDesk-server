const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lbo3hl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const cateroriesCollection = client.db('anyDesk').collection('categories')
        const categoriesIdCollection = client.db('anyDesk').collection('furnitures')
        const ordersCollection = client.db('anyDesk').collection('orders')

        app.get('/categories', async(req, res) =>{
            const query = {};
            const options = await cateroriesCollection.find(query).toArray();
            res.send(options);
        })

        app.get('/category/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {categoryID: id};
            const result = await categoriesIdCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/orders', async(req, res) =>{
            const booking = req.body;
            console.log(booking);
            const result = await ordersCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/order', async(req, res) =>{
            const email = req.query.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        })

    }
    finally{

    }
}
run().catch(console.log)



// const categories = require('./data/categories.json')
// const items = require('./data/furniture.json')


// // app.get('/categories', (req, res) =>{
// //     res.send(categories);
// // })

// // app.get('/category/:id', (req, res) =>{
// //     const id = req.params.id;
// //     console.log(id)
// //     const selectedCategory = items.filter( item => item.categoryID === id);
// //     res.send(selectedCategory);
// // })

// app.get('/items/:id', (req, res) =>{
//     const id = req.params.id;
//     const selctedItems = items.find( item => item._id === id);
//     res.send(selctedItems);
// })

app.get('/', (req, res) =>{
    res.send('Assignment api running...');
});

app.listen(port, () =>{
    console.log(`Assignment API running categoryName on ${port}`);
})

