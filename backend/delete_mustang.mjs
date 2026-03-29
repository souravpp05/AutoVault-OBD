import mongoose from 'mongoose'

await mongoose.connect('mongodb://localhost:27017/fueltrack')

const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }))

// Delete all vehicles belonging to the deleted test user (Ford Mustang + Test Car)
const result = await Vehicle.deleteMany({ userId: '54924b6b-2f27-4b6e-aae6-7d29b01f1a32' })

console.log(`Deleted ${result.deletedCount} vehicle(s)`)

await mongoose.disconnect()
