import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fueltrack'

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
        console.log('✅ Connected to MongoDB:', MONGO_URI)
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    }
}

export { connectDB }
