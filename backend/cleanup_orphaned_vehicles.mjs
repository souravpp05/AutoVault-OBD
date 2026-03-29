import mongoose from 'mongoose'

try {
  await mongoose.connect('mongodb://localhost:27017/fueltrack')
  
  const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }))
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
  
  const vehicles = await Vehicle.find({}).lean()
  const users = await User.find({}).lean()
  
  const userIds = new Set(users.map(u => u.userId))
  
  const orphanedVehicles = vehicles.filter(v => !userIds.has(v.userId))
  
  if (orphanedVehicles.length > 0) {
    const orphanedIds = orphanedVehicles.map(v => v.id)
    const deleteResult = await Vehicle.deleteMany({ id: { $in: orphanedIds } })
    console.log(`Deleted ${deleteResult.deletedCount} orphaned vehicles.\n`)
  } else {
    console.log('No orphaned vehicles found.\n')
  }
  
  // Show remaining users and their vehicles
  const remainingVehicles = await Vehicle.find({}).lean()
  const remainingUsers = await User.find({}).lean()
  const userMap = remainingUsers.reduce((acc, user) => {
    acc[user.userId] = user
    return acc
  }, {})
  
  const combined = remainingVehicles.map(v => {
    const user = userMap[v.userId] || {}
    return {
      vehicle: `${v.make} ${v.model} (${v.year}) - ${v.plate}`,
      owner: user.username || 'N/A',
      email: user.email || 'N/A'
    }
  })
  
  console.log('--- Remaining Users and Vehicles ---')
  console.table(combined)

} catch (error) {
  console.error('Error during cleanup:', error)
} finally {
  await mongoose.disconnect()
}
