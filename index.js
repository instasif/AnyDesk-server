const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lbo3hl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    console.log('token JWT', req.headers.author);
    const authHeader = req.headers.author;
    if(!authHeader){
        return res.status(401).send('unauthorized acceess')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    });
}


async function run(){
    try{
        const cateroriesCollection = client.db('anyDesk').collection('categories');
        const categoriesIdCollection = client.db('anyDesk').collection('furnitures');
        const ordersCollection = client.db('anyDesk').collection('orders');
        const usersCollection = client.db('anyDesk').collection('users');
        const addedProductsCollection = client.db('anyDesk').collection('addedProducts');

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
        });

        // app.delete('/order/:id', async(req, res)=>{
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await ordersCollection.deleteOne(filter);
        //     res.send(result);
        // })

        app.get('/order', verifyJWT, async(req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'})
            }
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });

        

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({accessToken: ''})
        });

        app.post('/users', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', async(req, res) =>{
            const query ={};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = { email};
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        })

        app.put('/users/admin/:id', verifyJWT, async(req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {eamil: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.get('/addedProducts', async(req, res) =>{
            const query = {};
            const results = await addedProductsCollection.find(query).toArray();
            res.send(results);
        })
        
        app.post('/addedProducts', async(req, res) =>{
            const product = req.body;
            const result = await addedProductsCollection.insertOne(product);
            res.send(result);
        });

        

    }
    finally{

    }
}
run().catch(console.log)

app.get('/', (req, res) =>{
    res.send('Assignment api running...');
});

app.listen(port, () =>{
    console.log(`Assignment API running categoryName on ${port}`);
})

