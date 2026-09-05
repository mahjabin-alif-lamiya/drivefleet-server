require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db('driveFleetDB').collection('cars');
    const result = await carCollection.deleteMany({ ownerEmail: 'seed@drivefleet.com' });
    console.log(`${result.deletedCount} seed cars removed`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
