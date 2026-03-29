const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('fueltrack');
  const result = await db.collection('users').deleteMany({
    username: { $regex: /test|demo/i }
  });
  console.log(`Deleted ${result.deletedCount} demo/test users`);
  await client.close();
}
run().catch(console.dir);
