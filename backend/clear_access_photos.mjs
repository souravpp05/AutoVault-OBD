import mongoose from 'mongoose'

await mongoose.connect('mongodb://localhost:27017/fueltrack')

const result = await mongoose.connection.collection('vehicles').updateMany(
  { make: { $regex: /suzuki/i }, model: { $regex: /access/i } },
  { $set: { photos: [], photoUrl: null } }
)

console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`)

const docs = await mongoose.connection.collection('vehicles').find(
  { make: { $regex: /suzuki/i }, model: { $regex: /access/i } },
  { projection: { make: 1, model: 1, photos: 1, photoUrl: 1 } }
).toArray()
console.log('After update:', JSON.stringify(docs, null, 2))

await mongoose.disconnect()
