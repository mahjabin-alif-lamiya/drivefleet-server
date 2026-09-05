const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const carCollection = client.db('driveFleetDB').collection('cars');
const userCollection = client.db('driveFleetDB').collection('users');
const bookingCollection = client.db('driveFleetDB').collection('bookings');

const JWT_SECRET = process.env.JWT_SECRET || 'drivefleet_secret_key';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send({ message: 'Unauthorized access' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Unauthorized access' });
    req.user = decoded;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('DriveFleet server is running');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, photoURL, password } = req.body;
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) return res.status(400).send({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, photoURL, password: hashedPassword };
    const result = await userCollection.insertOne(newUser);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) return res.status(401).send({ message: 'Invalid email or password' });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).send({ message: 'Invalid email or password' });
    const token = jwt.sign({ email: user.email, name: user.name, photoURL: user.photoURL }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions).send({ success: true, user: { name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (error) {
    res.status(500).send({ message: 'Login failed' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions).send({ success: true });
});

app.get('/me', verifyToken, (req, res) => {
  res.send({ email: req.user.email, name: req.user.name, photoURL: req.user.photoURL });
});

app.get('/cars', async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = {};
    if (search) query.carName = { $regex: search, $options: 'i' };
    if (type) query.carType = type;
    const cars = await carCollection.find(query).toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch cars' });
  }
});

app.get('/cars/:id', async (req, res) => {
  try {
    const car = await carCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.send(car);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch car' });
  }
});

app.post('/cars', verifyToken, async (req, res) => {
  try {
    const newCar = req.body;
    newCar.ownerEmail = req.user.email;
    newCar.bookingCount = 0;
    const result = await carCollection.insertOne(newCar);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to add car' });
  }
});

app.get('/my-cars', verifyToken, async (req, res) => {
  try {
    const cars = await carCollection.find({ ownerEmail: req.user.email }).toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch your cars' });
  }
});

app.put('/cars/:id', verifyToken, async (req, res) => {
  try {
    const result = await carCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to update car' });
  }
});

app.delete('/cars/:id', verifyToken, async (req, res) => {
  try {
    const result = await carCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete car' });
  }
});

app.post('/bookings', verifyToken, async (req, res) => {
  try {
    const booking = req.body;
    booking.userEmail = req.user.email;
    booking.bookingDate = new Date();
    const result = await bookingCollection.insertOne(booking);
    await carCollection.updateOne(
      { _id: new ObjectId(booking.carId) },
      { $inc: { bookingCount: 1 } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to create booking' });
  }
});

app.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await bookingCollection.find({ userEmail: req.user.email }).toArray();
    res.send(bookings);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch bookings' });
  }
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run();

app.listen(port, () => {
  console.log(`DriveFleet server running on port ${port}`);
});