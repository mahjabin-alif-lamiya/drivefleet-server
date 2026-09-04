const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB এর সাথে কানেক্ট হয়েছে");

    const carCollection = client.db('driveFleetDB').collection('cars');

    // টেস্ট রুট
    app.get('/', (req, res) => {
      res.send('DriveFleet server চলছে');
    });

    // সব গাড়ির তথ্য আনা
    app.get('/cars', async (req, res) => {
      const cars = await carCollection.find({}).toArray();
      res.send(cars);
    });

    // নতুন গাড়ি যোগ করা
    app.post('/cars', async (req, res) => {
      const newCar = req.body;
      const result = await carCollection.insertOne(newCar);
      res.send(result);
    });

  } catch (error) {
    console.error(error);
  }
}
run();

app.listen(port, () => {
  console.log(`DriveFleet server port ${port} এ চলছে`);
});