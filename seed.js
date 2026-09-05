require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const cars = [
  { carName: 'Toyota Corolla 2022', price: 3500, carType: 'Sedan', imageUrl: 'https://di-enrollment-api.s3.amazonaws.com/toyota/models/2022/corolla/trims/SE.jpg', seatCapacity: 5, location: 'Dhaka', description: 'Comfortable and fuel-efficient sedan, perfect for daily commutes.', availability: 'Available', bookingCount: 0, ownerEmail: 'seed@drivefleet.com' },
  { carName: 'Honda CR-V 2023', price: 4200, carType: 'SUV', imageUrl: 'https://honda.com.bd/assets/dhs/images/overview_crv/overview8.jpg', seatCapacity: 5, location: 'Chittagong', description: 'Spacious SUV with great mileage, ideal for family trips.', availability: 'Available', bookingCount: 0, ownerEmail: 'seed@drivefleet.com' },
  { carName: 'Suzuki Alto 2021', price: 1500, carType: 'Hatchback', imageUrl: 'https://i.ytimg.com/vi/w2xo5reSQpg/maxresdefault.jpg', seatCapacity: 4, location: 'Dhaka', description: 'Compact and easy to drive, great for city roads.', availability: 'Available', bookingCount: 0, ownerEmail: 'seed@drivefleet.com' },
  { carName: 'Mercedes-Benz C-Class', price: 9500, carType: 'Luxury', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0tqjBzP-z818QVmlwZkAwV7q851k3JwomUvwBWJrV0Q&s=10', seatCapacity: 5, location: 'Dhaka', description: 'Premium luxury sedan with top-notch comfort and style.', availability: 'Available', bookingCount: 0, ownerEmail: 'seed@drivefleet.com' },
  { carName: 'Toyota Hiace 2020', price: 3800, carType: 'SUV', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_svel3jteC4JqeYS_zjAbyfnBqj19Hv4aQn_jpW9uwKMcPxoY', seatCapacity: 12, location: 'Sylhet', description: 'Perfect for group travel and long trips.', availability: 'Available', bookingCount: 0, ownerEmail: 'seed@drivefleet.com' },
 
]
async function run() {
  try {
    await client.connect();
    const carCollection = client.db('driveFleetDB').collection('cars');
    const result = await carCollection.insertMany(cars);
    console.log(`${result.insertedCount} cars added successfully`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();