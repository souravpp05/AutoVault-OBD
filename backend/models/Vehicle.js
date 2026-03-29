import mongoose from 'mongoose'

const fuelLogSchema = new mongoose.Schema({
    date: String,
    liters: Number,
    distance: Number,
    odometer: Number,
    price: Number
}, { _id: false })

const documentSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    data: String,
    expiry: String,
    size: Number
}, { _id: false })

const alertSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    type: String,
    notes: String
}, { _id: false })

const obdHealthSchema = new mongoose.Schema({
    healthScore: { type: Number, default: 0 },
    healthStatus: { type: String, default: 'Unknown' },
    checkEngine: { type: Boolean, default: false },
    checkEngineCode: { type: String, default: '' },
    checkEngineDesc: { type: String, default: '' },
    batteryVoltage: { type: Number, default: 0 },
    batteryHealth: { type: Number, default: 0 },
    batteryStatus: { type: String, default: 'Unknown' },
    fuelLevel: { type: Number, default: 0 },
    fuelPercent: { type: Number, default: 0 },
    tankCapacity: { type: Number, default: 0 },
    avgMileage: { type: Number, default: 0 },
    odometer: { type: Number, default: 0 },
    _lastBridgeOdometer: { type: Number, default: 0 },
    lastServiceKm: { type: Number, default: 0 },
    nextServiceKm: { type: Number, default: 5000 },
    serviceKmRemaining: { type: Number, default: 5000 },
    lastOilChangeKm: { type: Number, default: 0 },
    nextOilChangeKm: { type: Number, default: 5000 },
    oilChangeKmRemaining: { type: Number, default: 5000 },
    oilChangeStatus: { type: String, default: 'OK' },
    serviceStatus: { type: String, default: 'OK' },
    lastUpdated: { type: Date, default: null }
}, { _id: false })

const maintenanceSchema = new mongoose.Schema({
    nextServiceKm: { type: Number, default: 0 },
    nextOilChangeKm: { type: Number, default: 0 },
    nextTyreChangeKm: { type: Number, default: 0 }
}, { _id: false })

const vehicleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    make: String,
    model: String,
    plate: String,
    year: String,
    photoUrl: { type: String },
    photos: { type: [String], default: [] },
    location: { type: String },
    isForRent: { type: Boolean, default: false },
    isForSell: { type: Boolean, default: false },
    rentPrice: { type: Number, default: null },
    rentDailyKmLimit: { type: Number, default: null },
    rentExtraKmPrice: { type: Number, default: null },
    sellPrice: { type: Number, default: null },
    fuelLogs: [fuelLogSchema],
    documents: [documentSchema],
    alerts: [alertSchema],
    obdHealth: { type: obdHealthSchema, default: () => ({}) },
    maintenance: { type: maintenanceSchema, default: () => ({}) }
}, { timestamps: true })

export default mongoose.model('Vehicle', vehicleSchema)
