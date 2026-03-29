import mongoose from 'mongoose'

await mongoose.connect('mongodb://localhost:27017/fueltrack')

const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }))
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))

// Get the Ford Mustang
const mustang = await Vehicle.findOne({ make: 'Ford', model: 'Mustang' }).lean()
console.log('Ford Mustang userId:', mustang?.userId)

// Try to find user by userId
const byUserId = await User.findOne({ userId: mustang?.userId }).lean()
console.log('User by userId:', byUserId)

// Try to find user by _id
try {
  const byId = await User.findById(mustang?.userId).lean()
  console.log('User by _id:', byId)
} catch(e) {
  console.log('Not a valid ObjectId')
}

// Also check all vehicles for this userId
const allVehicles = await Vehicle.find({ userId: mustang?.userId }).lean()
console.log('All vehicles by this user:', allVehicles.map(v => ({ make: v.make, model: v.model, plate: v.plate })))

await mongoose.disconnect()
