import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    photoUrl: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
