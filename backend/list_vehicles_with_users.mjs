import mongoose from 'mongoose'

try {
  await mongoose.connect('mongodb://localhost:27017/fueltrack')
  
  const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }))
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
  
  const vehicles = await Vehicle.find({}).lean()
  const users = await User.find({}).lean()
  
  // Create a map for quick user lookup
  const userMap = users.reduce((acc, user) => {
    acc[user.userId] = user
    return acc
  }, {})
  
  const combined = vehicles.map(v => {
    const user = userMap[v.userId] || {}
    return {
      vehicle: {
        make: v.make,
        model: v.model,
        year: v.year,
        plate: v.plate
      },
      user: {
        name: user.name || 'N/A',
        username: user.username || 'unknown',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A'
      }
    }
  })
  
  process.stdout.write(JSON.stringify(combined, null, 2))

} catch (error) {
  process.stderr.write(`Error: ${error.message}\n`)
} finally {
  await mongoose.disconnect()
}
