import mongoose from 'mongoose'

await mongoose.connect('mongodb://localhost:27017/fueltrack')

const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }))

const listed = await Vehicle.find({ $or: [{ isForRent: true }, { isForSell: true }] }).lean()

console.log(JSON.stringify(listed.map(v => ({
  make: v.make,
  model: v.model,
  year: v.year,
  plate: v.plate,
  isForRent: v.isForRent,
  isForSell: v.isForSell,
  location: v.location,
  userId: v.userId
})), null, 2))

await mongoose.disconnect()
