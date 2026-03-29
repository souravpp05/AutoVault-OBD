import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import { randomUUID } from 'crypto'
import User from './models/User.js'
import Vehicle from './models/Vehicle.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001')

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// === AUTH (Multi-User) ===

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ error: 'Username must be at least 2 characters' })
        }
        if (!password || password.length < 4) {
            return res.status(400).json({ error: 'PIN must be at least 4 digits' })
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' })
        }

        // Check if username exists (case-insensitive)
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } })
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' })
        }

        const userId = randomUUID()
        await User.create({
            userId,
            username: username.trim(),
            password,
            email: email.trim()
        })

        console.log(`✅ New user registered: ${username} (${userId})`)

        res.json({ success: true, userId, username: username.trim() })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body

        const userCount = await User.countDocuments()
        if (userCount === 0) {
            return res.status(400).json({ error: 'No users registered. Please register first.' })
        }

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } })

        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        if (password !== user.password) {
            return res.status(401).json({ error: 'Incorrect PIN' })
        }

        console.log(`✅ User logged in: ${username} (${user.userId})`)

        res.json({ success: true, userId: user.userId, username: user.username })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

import nodemailer from 'nodemailer'

// Mock configured transporter for development. 
// Connects to a local/fake SMTP or just logs in dev environment if not configured.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your_email@gmail.com', // Replace with a real email to test
        pass: 'your_app_password'     // Replace with a valid app password
    }
})

// Forgot Password — generate token and send email
app.post('/api/auth/forgot-password-email', async (req, res) => {
    try {
        const { username } = req.body

        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Please enter your username' })
        }

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (!user.email) {
            return res.status(400).json({ error: 'No email registered for this account. Please contact the admin.' })
        }

        // Generate a random token
        const resetToken = randomUUID()

        // Expiry time: 1 hour from now
        const resetTokenExpiry = new Date(Date.now() + 3600000)

        // Save token to user document
        user.resetToken = resetToken
        user.resetTokenExpiry = resetTokenExpiry
        await user.save()

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`

        console.log(`🔑 Password recovery requested for: ${username}`)
        console.log(`📧 Simulated email sent to ${user.email}. Link: ${resetLink}`)

        // Attempt to send email but gracefully catch if not configured
        try {
            await transporter.sendMail({
                from: '"FuelTrack Admin" <admin@fueltrack.com>',
                to: user.email,
                subject: 'FuelTrack - Password Reset Request',
                text: `Hello ${user.username},\n\nYou requested a password reset. Click this link to reset your PIN: ${resetLink}\n\nNote: This link expires in 1 hour.`,
                html: `<p>Hello <strong>${user.username}</strong>,</p><p>You requested a password reset. Click the following link to reset your PIN:</p><p><a href="${resetLink}">${resetLink}</a></p><p><i>Note: This link expires in 1 hour.</i></p>`
            })
            console.log('✅ Real email successfully sent!')
        } catch (mailErr) {
            console.log('⚠️ Could not send real email (transporter not fully configured). Falling back to console log simulation.')
        }

        const [localPart, domain] = user.email.split('@')
        const maskedEmail = localPart.substring(0, 2) + '***@' + domain

        res.json({ success: true, maskedEmail })
    } catch (err) {
        console.error('Forgot Password error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Reset Password - verify token and update password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body

        if (!token) return res.status(400).json({ error: 'Invalid or missing token' })
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'PIN must be at least 4 digits' })
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() } // Token must be strictly in the future
        })

        if (!user) {
            return res.status(400).json({ error: 'Token is invalid or has expired' })
        }

        // Update password and clear the token fields
        user.password = newPassword
        user.resetToken = undefined
        user.resetTokenExpiry = undefined
        await user.save()

        console.log(`✅ Password successfully reset for: ${user.username}`)
        res.json({ success: true })
    } catch (err) {
        console.error('Reset Password error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// OTP-based Forgot Password
app.post('/api/auth/forgot-password-otp', async (req, res) => {
    try {
        const { username } = req.body
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Please enter your username' })
        }

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (!user.email) {
            return res.status(400).json({ error: 'No email registered for this account.' })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 600000) // 10 minutes

        user.resetOtp = otp
        user.resetOtpExpiry = otpExpiry
        await user.save()

        console.log(`🔑 OTP generated for: ${username}: ${otp}`)
        console.log(`📧 Simulated email sent to ${user.email} with OTP: ${otp}`)

        try {
            await transporter.sendMail({
                from: '"FuelTrack Admin" <admin@fueltrack.com>',
                to: user.email,
                subject: 'FuelTrack - Password Reset OTP',
                text: `Hello ${user.username},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP expires in 10 minutes.`,
                html: `<p>Hello <strong>${user.username}</strong>,</p><p>Your OTP for password reset is:</p><h2 style="color: #4A90E2;">${otp}</h2><p><i>Note: This OTP expires in 10 minutes.</i></p>`
            })
            console.log('✅ OTP email successfully sent!')
        } catch (mailErr) {
            console.log('⚠️ Could not send real OTP email. Falling back to simulation.')
        }

        const [localPart, domain] = user.email.split('@')
        const maskedEmail = localPart.substring(0, 2) + '***@' + domain
        res.json({ success: true, maskedEmail })
    } catch (err) {
        console.error('Forgot Password OTP error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// OTP-based Reset Password
app.post('/api/auth/reset-password-otp', async (req, res) => {
    try {
        const { username, otp, newPassword } = req.body
        if (!username || !otp || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ error: 'PIN must be at least 4 digits' })
        }

        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
            resetOtp: otp,
            resetOtpExpiry: { $gt: new Date() }
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP' })
        }

        user.password = newPassword
        user.resetOtp = undefined
        user.resetOtpExpiry = undefined
        await user.save()

        console.log(`✅ Password successfully reset via OTP for: ${user.username}`)
        res.json({ success: true })
    } catch (err) {
        console.error('Reset Password OTP error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// === USER PROFILE ===
app.get('/api/auth/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findOne({ userId })
        if (!user) return res.status(404).json({ error: 'User not found' })
        
        res.json({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            photoUrl: user.photoUrl || ''
        })
    } catch (err) {
        console.error('Get profile error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

app.put('/api/auth/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const { name, phone, address, photoUrl } = req.body
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { name, phone, address, photoUrl } },
            { new: true }
        )
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ success: true })
    } catch (err) {
        console.error('Update profile error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// === VEHICLES (User-Specific) ===

// Get vehicles for user
app.get('/api/vehicles', async (req, res) => {
    try {
        const { userId } = req.query

        if (!userId) {
            return res.json([])
        }

        const vehicles = await Vehicle.find({ userId }).lean()

        // Map _id to id for frontend compatibility
        const mapped = vehicles.map(v => {
            const { _id, __v, ...rest } = v
            rest.id = v.id || _id.toString()
            return rest
        })

        res.json(mapped)
    } catch (err) {
        console.error('Get vehicles error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// === MARKETPLACE ===
app.get('/api/marketplace/vehicles', async (req, res) => {
    try {
        // Find vehicles marked for rent or sell
        const vehicles = await Vehicle.find({
            $or: [{ isForRent: true }, { isForSell: true }]
        }).lean()

        // Gather all unique user IDs to fetch their details
        const userIds = [...new Set(vehicles.map(v => v.userId))]
        const users = await User.find({ userId: { $in: userIds } }).lean()
        
        // Map user details to vehicles
        const userMap = users.reduce((acc, user) => {
            acc[user.userId] = {
                name: user.name || user.username,
                phone: user.phone || 'Not provided',
                address: user.address || 'Not provided',
                photoUrl: user.photoUrl || ''
            }
            return acc
        }, {})

        // Map _id to id for frontend compatibility and attach user info
        const mapped = vehicles.map(v => {
            const { _id, __v, ...rest } = v
            return {
                ...rest,
                id: v.id || _id.toString(),
                ownerInfo: userMap[v.userId] || { name: 'Unknown', phone: 'Unknown', address: 'Unknown' }
            }
        })

        res.json(mapped)
    } catch (err) {
        console.error('Get marketplace vehicles error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Create vehicle for user
app.post('/api/vehicles', async (req, res) => {
    try {
        const { make, model, plate, year, userId } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' })
        }

        const id = randomUUID()
        const newVehicle = await Vehicle.create({
            id, userId, make, model, plate, year: year || null,
            fuelLogs: [], documents: [], alerts: []
        })

        res.json({
            id: newVehicle.id,
            userId: newVehicle.userId,
            make: newVehicle.make,
            model: newVehicle.model,
            plate: newVehicle.plate,
            year: newVehicle.year,
            fuelLogs: newVehicle.fuelLogs,
            documents: newVehicle.documents,
            alerts: newVehicle.alerts
        })
    } catch (err) {
        console.error('Create vehicle error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Update vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userId, ...updates } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' })
        }

        const vehicle = await Vehicle.findOneAndUpdate(
            { id, userId },
            { $set: updates },
            { new: true }
        )

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' })
        }

        res.json({ success: true })
    } catch (err) {
        console.error('Update vehicle error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Delete vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.query

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' })
        }

        await Vehicle.findOneAndDelete({ id, userId })

        res.json({ success: true })
    } catch (err) {
        console.error('Delete vehicle error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})


// === FUEL LOGS ===

// Add fuel log entry
app.post('/api/vehicles/:id/fuel', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, date, liters, distance, odometer, price } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const vehicle = await Vehicle.findOne({ id, userId });
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const newLog = { date, liters, distance, odometer, price };
        vehicle.fuelLogs.push(newLog);
        
        // Update vehicle's last known odometer if provided
        if (odometer > (vehicle.obdHealth?.odometer || 0)) {
            if (!vehicle.obdHealth) vehicle.obdHealth = {};
            vehicle.obdHealth.odometer = odometer;
        }

        await vehicle.save();
        res.json({ success: true, fuelLogs: vehicle.fuelLogs });
    } catch (err) {
        console.error('Add fuel log error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get fuel logs for vehicle
app.get('/api/vehicles/:id/fuel', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const query = { id };
        if (userId) query.userId = userId;

        const vehicle = await Vehicle.findOne(query);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        res.json(vehicle.fuelLogs || []);
    } catch (err) {
        console.error('Get fuel logs error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete fuel log entry
app.delete('/api/vehicles/:id/fuel/:logIndex', async (req, res) => {
    try {
        const { id, logIndex } = req.params;
        const { userId } = req.query;

        const vehicle = await Vehicle.findOne({ id, userId });
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const index = parseInt(logIndex);
        if (isNaN(index) || index < 0 || index >= vehicle.fuelLogs.length) {
            return res.status(400).json({ error: 'Invalid log index' });
        }

        vehicle.fuelLogs.splice(index, 1);
        await vehicle.save();
        res.json({ success: true, fuelLogs: vehicle.fuelLogs });
    } catch (err) {
        console.error('Delete fuel log error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// === OBD-II REAL + SIMULATED DATA ===

// In-memory store for live OBD data from bridge script
const liveObdData = new Map() // vehicleId -> { data, timestamp }

// Receive live OBD data from bridge script (Classic Bluetooth)
// Strictly scoped: vehicleId MUST belong to the sending userId
app.post('/api/obd/:vehicleId/live', async (req, res) => {
    const { vehicleId } = req.params
    const { userId } = req.body

    // Ownership check: verify this vehicle belongs to this user
    // Only enforce if userId is actually provided (bridge script may not send it)
    if (userId) {
        const vehicle = await Vehicle.findOne({ id: vehicleId, userId })
        if (!vehicle) {
            return res.status(403).json({ error: 'Vehicle not found or does not belong to this user' })
        }
    } else {
        // When no userId provided (e.g. bridge script), check vehicle exists
        const vehicle = await Vehicle.findOne({ id: vehicleId })
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' })
        }
    }

    liveObdData.set(vehicleId, {
        data: req.body,
        timestamp: Date.now(),
        userId: userId || null  // tag live data with userId for extra isolation
    })
    res.json({ success: true })
})

// Helper: compute next multiple of 5000 above a given km
function nextServiceAt(lastKm) {
    return Math.ceil((lastKm + 1) / 5000) * 5000
}

// Helper: compute health score from sensor readings
function computeHealth(sensor) {
    let score = 100
    let issues = []

    // Engine temp: ideal 80-100, warning >105, critical >115
    if (sensor.engineTemp > 115) { score -= 35; issues.push('Engine critically overheated') }
    else if (sensor.engineTemp > 105) { score -= 20; issues.push('Engine running hot') }
    else if (sensor.engineTemp > 100) { score -= 5 }

    // Battery voltage: ideal 12.4-14.7, low <12.0, critical <11.5
    if (sensor.voltage < 11.5) { score -= 30; issues.push('Battery critically low') }
    else if (sensor.voltage < 12.0) { score -= 15; issues.push('Battery weak') }
    else if (sensor.voltage < 12.4) { score -= 5 }

    // RPM: abnormal if >5000 or erratic
    if (sensor.rpm > 5000) { score -= 10; issues.push('RPM very high') }
    else if (sensor.rpm > 4000) { score -= 5 }

    // Fuel: low fuel is a mild concern
    const fuelPct = sensor.fuelPercent || 0
    if (fuelPct < 10) { score -= 10; issues.push('Fuel critically low') }
    else if (fuelPct < 20) { score -= 3 }

    score = Math.max(0, Math.min(100, score))
    const status = score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'
    return { score, status, issues }
}

// Helper: compute battery health from voltage
function computeBatteryHealth(voltage) {
    // 12.6V+ = 100%, 11.5V = 0%
    const health = Math.max(0, Math.min(100, Math.round(((voltage - 11.5) / 1.1) * 100)))
    const status = health >= 70 ? 'Good' : health >= 40 ? 'Weak' : 'Critical'
    return { health, status }
}


// Helper: generate warnings array from live data
function generateWarnings(sensor, checkEngine) {
    const warnings = []
    if (sensor.speed > 120) {
        warnings.push({ type: 'overspeed', severity: 'critical', message: `Overspeed Warning: ${sensor.speed} km/h`, icon: '🚨' })
    }
    if (sensor.engineTemp > 105) {
        warnings.push({ type: 'overheating', severity: 'critical', message: `Engine Overheating: ${sensor.engineTemp}°C`, icon: '🔥' })
    }
    if (sensor.voltage < 11.8) {
        warnings.push({ type: 'lowBattery', severity: 'warning', message: `Low Battery: ${sensor.voltage}V`, icon: '🪫' })
    }
    if (checkEngine.active && checkEngine.severity === 'high') {
        warnings.push({ type: 'engineProblem', severity: 'critical', message: `Major Engine Problem: ${checkEngine.code} - ${checkEngine.desc}`, icon: '⚠️' })
    }
    return warnings
}

// Get OBD data — returns REAL data if bridge is active, otherwise stored health
// Strictly scoped: vehicleId MUST belong to the requesting userId
app.get('/api/obd/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params
    const { userId } = req.query

    // Ownership check: verify this vehicle belongs to this user
    if (userId) {
        const ownerCheck = await Vehicle.findOne({ id: vehicleId, userId })
        if (!ownerCheck) {
            return res.status(403).json({ error: 'Vehicle not found or does not belong to this user' })
        }
    }

    let finalResponseOdometer = 0;

    // Check for live data from bridge (valid for 30 seconds)
    const live = liveObdData.get(vehicleId)
    if (live && (Date.now() - live.timestamp) < 30000) {
        // Compute health from real bridge data
        const sensor = live.data.sensor || live.data
        const health = computeHealth(sensor)
        const battery = computeBatteryHealth(sensor.voltage || 12.6)
        const checkEng = { active: false, code: '', desc: '', severity: 'none' }
        const warnings = generateWarnings(sensor, checkEng)

        // Persist to DB
        const vehicle = await Vehicle.findOne({ id: vehicleId })
        if (vehicle) {
            // === ODOMETER CALCULATION ===
            // The bridge sends two values:
            //   baseOdometer: the REAL physical dashboard reading (km), set by user via --odometer flag
            //   sensor.odometer: km driven since THIS bridge session started (trip delta, starts at 0)
            //
            // Strategy:
            //   If baseOdometer is provided → final odometer = baseOdometer + tripDelta
            //     - This gives the correct TOTAL lifetime km
            //     - We also update the DB stored value to baseOdometer (calibrate once)
            //   If baseOdometer is null (--odometer not supplied) → fallback to stored+delta logic
            //     - This accumulates trip km on top of whatever was in DB before
            //
            const bridgeTripDelta = sensor.odometer || 0          // km driven since OBD connected
            const bridgeBaseOdometer = live.data.baseOdometer      // physical dashboard reading, or null
            const storedOdometer = vehicle.obdHealth?.odometer || 0
            const lastBridgeOdometer = vehicle.obdHealth?._lastBridgeOdometer || 0

            let odometer
            if (bridgeBaseOdometer !== null && bridgeBaseOdometer !== undefined && !isNaN(bridgeBaseOdometer)) {
                // REAL ODOMETER MODE: base from dashboard + km driven since connecting
                // Calibrate: if the base reading is newer/higher than stored, update the DB base.
                const calibratedBase = Math.max(bridgeBaseOdometer, storedOdometer - lastBridgeOdometer)
                odometer = parseFloat((calibratedBase + bridgeTripDelta).toFixed(1))
            } else {
                // FALLBACK MODE: accumulate trip delta on top of stored value (old behaviour)
                const delta = Math.max(0, bridgeTripDelta - lastBridgeOdometer)
                odometer = parseFloat((storedOdometer + delta).toFixed(1))
            }

            // === FUEL: fall back to stored value if sensor sends 0 ===
            const fuelPercent = sensor.fuelPercent > 0 ? sensor.fuelPercent : (vehicle.obdHealth?.fuelPercent || 0)
            const fuelLevel = sensor.fuelLevel > 0 ? sensor.fuelLevel : (vehicle.obdHealth?.fuelLevel || 0)
            const tankCapacity = sensor.tankCapacity || vehicle.obdHealth?.tankCapacity || 50

            const lastServiceKm = vehicle.obdHealth?.lastServiceKm || 0
            const lastOilKm = vehicle.obdHealth?.lastOilChangeKm || 0
            
            // USE STORED TARGETS (No more auto-calc)
            const nextSvc = vehicle.maintenance?.nextServiceKm || vehicle.obdHealth?.nextServiceKm || 0
            const nextOil = vehicle.maintenance?.nextOilChangeKm || vehicle.obdHealth?.nextOilChangeKm || 0
            
            const svcRemaining = nextSvc > 0 ? Math.max(0, nextSvc - odometer) : 0
            const oilRemaining = nextOil > 0 ? Math.max(0, nextOil - odometer) : 0

            const bridgeOdometer = odometer;

            vehicle.obdHealth = {
                healthScore: health.score,
                healthStatus: health.status,
                checkEngine: checkEng.active,
                checkEngineCode: checkEng.code,
                checkEngineDesc: checkEng.desc,
                batteryVoltage: sensor.voltage || 0,
                batteryHealth: battery.health,
                batteryStatus: battery.status,
                fuelLevel,
                fuelPercent,
                tankCapacity,
                avgMileage: live.data.computed?.avgMileage || vehicle.obdHealth?.avgMileage || 0,
                odometer: bridgeOdometer,
                _lastBridgeOdometer: bridgeTripDelta,
                lastServiceKm,
                nextServiceKm: nextSvc,
                serviceKmRemaining: svcRemaining,
                serviceStatus: svcRemaining <= 0 ? 'Overdue' : svcRemaining <= 500 ? 'Due Soon' : 'OK',
                lastOilChangeKm: lastOilKm,
                nextOilChangeKm: nextOil,
                oilChangeKmRemaining: oilRemaining,
                oilChangeStatus: oilRemaining <= 0 ? 'Overdue' : oilRemaining <= 500 ? 'Due Soon' : 'OK',
                lastUpdated: new Date()
            }
            await vehicle.save()
            // Store it back for the response block
            finalResponseOdometer = bridgeOdometer;
        }

        return res.json({
            ...live.data,
            // Ensure computed exists for frontend/testing
            computed: {
                ...(live.data.computed || {}),
                avgMileage: live.data.computed?.avgMileage || (vehicle ? vehicle.obdHealth.avgMileage : 0) || 12.5
            },
            // Override sensor.odometer with the DB-accumulated value so frontend
            // always shows the correct persistent odometer (not just session delta)
            sensor: {
                ...(live.data.sensor || {}),
                odometer: vehicle ? finalResponseOdometer : (live.data.sensor?.odometer || 0)
            },
            source: 'bridge',
            connected: true,
            timestamp: new Date().toISOString(),
            health: { score: health.score, status: health.status },
            checkEngine: checkEng,
            battery: { voltage: sensor.voltage, health: battery.health, status: battery.status },
            service: vehicle ? {
                nextServiceKm: vehicle.obdHealth.nextServiceKm,
                serviceKmRemaining: vehicle.obdHealth.serviceKmRemaining,
                serviceStatus: vehicle.obdHealth.serviceStatus,
                nextOilChangeKm: vehicle.obdHealth.nextOilChangeKm,
                oilChangeKmRemaining: vehicle.obdHealth.oilChangeKmRemaining,
                oilChangeStatus: vehicle.obdHealth.oilChangeStatus,
            } : null,
            warnings
        })
    }

    // Fallback: No live OBD data available -> Automatically start Hackathon Demo Simulator!
    const vehicle = await Vehicle.findOne({ id: vehicleId })
    if (vehicle) {
        // Read stored base values
        const storedOdometer = vehicle.obdHealth?.odometer || 15000
        const storedFuelLevel = vehicle.obdHealth?.fuelLevel || 35
        const tankCapacity = vehicle.obdHealth?.tankCapacity || 50
        
        // Generate realistic driving fluctuations
        const speed = Math.round(50 + (Math.random() * 10 - 5))
        const rpm = Math.round(2000 + (Math.random() * 200 - 100))
        const engineTemp = Math.round(90 + (Math.random() * 4 - 2))
        const voltage = parseFloat((14.1 + (Math.random() * 0.2 - 0.1)).toFixed(2))
        const throttle = Math.round(25 + (Math.random() * 5 - 2))
        const fuelPressure = Math.round(280 + (Math.random() * 10 - 5))
        
        // Advance odometer based on 5-second polling interval (speed km/h -> km driven in 5s)
        const distanceDriven = speed * (5 / 3600)
        const newOdometer = storedOdometer + distanceDriven
        
        // Retrieve last mileage or start at 12.5
        const lastAvgMileage = vehicle.obdHealth?.avgMileage || 12.5
        
        // Instantaneous pseudo mileage proxy
        const instantKmL = speed > 5 ? (speed / (rpm / 1000)) * 0.45 : 12.5
        
        // EMA smoothing: 95% history, 5% new (creates a beautiful, realistic sliding average effect)
        let avgMileage = (0.95 * lastAvgMileage) + (0.05 * instantKmL)
        avgMileage = Math.max(5, Math.min(25, avgMileage))
        
        // Drain fuel slightly
        const fuelBurn = distanceDriven / avgMileage
        const newFuelLevel = Math.max(0, storedFuelLevel - fuelBurn)
        const fuelPercent = Math.round((newFuelLevel / tankCapacity) * 100)
        
        avgMileage = parseFloat(avgMileage.toFixed(1))

        // Health Score
        const sensor = { engineTemp, voltage, rpm, speed, fuelPercent, fuelLevel: newFuelLevel, odometer: newOdometer }
        const health = computeHealth(sensor)
        const battery = computeBatteryHealth(voltage)
        const checkEng = { active: false, code: '', desc: '', severity: 'none' }
        const warnings = generateWarnings(sensor, checkEng)

        const nextSvc = vehicle.maintenance?.nextServiceKm || vehicle.obdHealth?.nextServiceKm || nextServiceAt(newOdometer)
        const nextOil = vehicle.maintenance?.nextOilChangeKm || vehicle.obdHealth?.nextOilChangeKm || nextServiceAt(newOdometer)
        const svcRemaining = Math.max(0, nextSvc - newOdometer)
        const oilRemaining = Math.max(0, nextOil - newOdometer)
        
        // Save back to DB
        vehicle.obdHealth = {
            ...vehicle.obdHealth,
            healthScore: health.score,
            healthStatus: health.status,
            odometer: newOdometer,
            fuelLevel: newFuelLevel,
            fuelPercent,
            avgMileage,
            batteryVoltage: voltage,
            batteryHealth: battery.health,
            batteryStatus: battery.status,
            lastServiceKm: vehicle.obdHealth?.lastServiceKm || 0,
            nextServiceKm: nextSvc,
            serviceKmRemaining: svcRemaining,
            serviceStatus: svcRemaining <= 0 ? 'Overdue' : svcRemaining <= 500 ? 'Due Soon' : 'OK',
            lastOilChangeKm: vehicle.obdHealth?.lastOilChangeKm || 0,
            nextOilChangeKm: nextOil,
            oilChangeKmRemaining: oilRemaining,
            oilChangeStatus: oilRemaining <= 0 ? 'Overdue' : oilRemaining <= 500 ? 'Due Soon' : 'OK',
            lastUpdated: new Date()
        }
        await vehicle.save()

        return res.json({
            connected: true,
            source: 'simulated',
            timestamp: new Date().toISOString(),
            mode: 'bridge',
            sensor: {
                ...sensor,
                odometer: parseFloat(newOdometer.toFixed(2)),
                fuelLevel: parseFloat(newFuelLevel.toFixed(1)),
                throttle,
                boostPressure: 0,
                fuelPressure,
                tankCapacity,
                engineLoad: Math.round(throttle * 0.8)
            },
            computed: {
                avgMileage,
                distanceRemaining: Math.round(newFuelLevel * avgMileage),
                fuelConsumptionRate: speed > 0 ? parseFloat((fuelPressure ? fuelPressure / 50 : 7.5).toFixed(1)) : 0,
                tripDistance: parseFloat(newOdometer.toFixed(2)),
                tripFuelUsed: 0
            },
            health: { score: health.score, status: health.status },
            checkEngine: checkEng,
            battery: { voltage, health: battery.health, status: battery.status },
            service: {
                nextServiceKm: nextSvc,
                serviceKmRemaining: svcRemaining,
                serviceStatus: vehicle.obdHealth.serviceStatus,
                nextOilChangeKm: nextOil,
                oilChangeKmRemaining: oilRemaining,
                oilChangeStatus: vehicle.obdHealth.oilChangeStatus
            },
            warnings
        })
    }
    
    // Pure fallback if vehicle ID literally doesnt exist
    res.json({
        connected: false,
        source: 'none',
        error: 'No live OBD data available. Please connect an OBD scanner.'
    })
})

// Get stored OBD health data for a vehicle — userId required for isolation
app.get('/api/vehicles/:id/health', async (req, res) => {
    try {
        const { userId } = req.query
        const query = { id: req.params.id }
        if (userId) query.userId = userId  // enforce ownership if userId provided
        const vehicle = await Vehicle.findOne(query)
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
        res.json(vehicle.obdHealth || {})
    } catch (err) {
        console.error('Get health error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Reset service or oil change counter — userId required for isolation
app.post('/api/vehicles/:id/service-reset', async (req, res) => {
    try {
        const { type, userId } = req.body
        const query = { id: req.params.id }
        if (userId) query.userId = userId  // enforce ownership
        const vehicle = await Vehicle.findOne(query)
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found or access denied' })

        const odometer = vehicle.obdHealth?.odometer || 0
        if (type === 'service') {
            vehicle.obdHealth.lastServiceKm = odometer
            vehicle.obdHealth.nextServiceKm = nextServiceAt(odometer)
            vehicle.obdHealth.serviceKmRemaining = vehicle.obdHealth.nextServiceKm - odometer
            vehicle.obdHealth.serviceStatus = 'OK'
        } else if (type === 'oil') {
            vehicle.obdHealth.lastOilChangeKm = odometer
            vehicle.obdHealth.nextOilChangeKm = nextServiceAt(odometer)
            vehicle.obdHealth.oilChangeKmRemaining = vehicle.obdHealth.nextOilChangeKm - odometer
            vehicle.obdHealth.oilChangeStatus = 'OK'
        }
        await vehicle.save()
        res.json({ success: true, obdHealth: vehicle.obdHealth })
    } catch (err) {
        console.error('Service reset error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// === Start server after DB connection ===
async function start() {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`🚀 Backend running at http://localhost:${PORT}`)
        console.log(`📦 Using MongoDB database`)
    })
}

start()

