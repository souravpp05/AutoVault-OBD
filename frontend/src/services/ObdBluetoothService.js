/**
 * OBD-II Bluetooth Service
 * 
 * Connects to ELM327 OBD-II scanners via Web Bluetooth API (BLE)
 * or falls back to server polling (for Classic Bluetooth via bridge script).
 * 
 * Supported PIDs:
 * - RPM, Coolant Temp, Boost Pressure, Throttle Position, Fuel Pressure, Mileage
 */

import API_URL from '../config'

// ELM327 BLE Service/Characteristic UUIDs (common for most BLE ELM327 adapters)
const ELM327_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'
const ELM327_NOTIFY_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'
const ELM327_WRITE_UUID = '0000fff2-0000-1000-8000-00805f9b34fb'

// Alternative UUIDs used by some ELM327 clones
const ALT_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'
const ALT_NOTIFY_UUID = '00002af0-0000-1000-8000-00805f9b34fb'
const ALT_WRITE_UUID = '00002af1-0000-1000-8000-00805f9b34fb'

// OBD-II PID commands
const OBD_PIDS = {
    RPM: { cmd: '010C\r', parse: (bytes) => ((bytes[0] * 256) + bytes[1]) / 4 },
    SPEED: { cmd: '010D\r', parse: (bytes) => bytes[0] },
    COOLANT_TEMP: { cmd: '0105\r', parse: (bytes) => bytes[0] - 40 },
    THROTTLE_POS: { cmd: '0111\r', parse: (bytes) => Math.round((bytes[0] / 255) * 100) },
    FUEL_PRESSURE: { cmd: '010A\r', parse: (bytes) => bytes[0] * 3 },
    FUEL_LEVEL: { cmd: '012F\r', parse: (bytes) => Math.round((bytes[0] / 255) * 100) },
    BATTERY_VOLTAGE: { cmd: '0142\r', parse: (bytes) => ((bytes[0] * 256) + bytes[1]) / 1000 },
    DISTANCE_CODES: { cmd: '0131\r', parse: (bytes) => (bytes[0] * 256) + bytes[1] },
    MAF: { cmd: '0110\r', parse: (bytes) => ((bytes[0] * 256) + bytes[1]) / 100 },
    BOOST_PRESSURE: { cmd: '010B\r', parse: (bytes) => bytes[0] }, // Intake manifold pressure (kPa)
    ENGINE_LOAD: { cmd: '0104\r', parse: (bytes) => Math.round((bytes[0] / 255) * 100) },
}

// AT initialization commands for ELM327
const ELM_INIT_COMMANDS = [
    'ATZ\r',    // Reset
    'ATE0\r',   // Echo off
    'ATL0\r',   // Linefeeds off
    'ATS0\r',   // Spaces off
    'ATSP0\r',  // Auto protocol
]

class ObdBluetoothService {
    constructor() {
        this.device = null
        this.server = null
        this.writeChar = null
        this.notifyChar = null
        this.connected = false
        this.mode = null // 'ble' or 'bridge'
        this.responseBuffer = ''
        this.responseResolve = null
        this.listeners = new Set()
        this.pollInterval = null
        this.lastData = null
        this.accumulatedOdometer = 0
        this.lastPollTime = null
        this.port = null // Web Serial Port
        this.reader = null
        this.writer = null
    }

    // Initialize odometer from database to avoid starting at 0
    setOdometerBaseline(kilometers) {
        if (typeof kilometers === 'number' && !isNaN(kilometers)) {
            this.accumulatedOdometer = kilometers
        }
    }

    // Check if Web Bluetooth is available
    static isWebBluetoothAvailable() {
        return typeof navigator !== 'undefined' && 'bluetooth' in navigator
    }

    // Check if Web Serial is available
    static isWebSerialAvailable() {
        return typeof navigator !== 'undefined' && 'serial' in navigator
    }

    // Subscribe to data updates
    onData(callback) {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    _notifyListeners(data) {
        this.lastData = data
        this.listeners.forEach(cb => cb(data))
    }

    // =============================================
    // BLE CONNECTION (Web Bluetooth API)
    // =============================================

    async connectBLE() {
        if (!ObdBluetoothService.isWebBluetoothAvailable()) {
            throw new Error('Web Bluetooth not available. Use Chrome/Edge on HTTPS or localhost.')
        }

        try {
            // Request device with ELM327 service UUIDs
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [ELM327_SERVICE_UUID] },
                    { services: [ALT_SERVICE_UUID] },
                    { namePrefix: 'OBD' },
                    { namePrefix: 'ELM' },
                    { namePrefix: 'VEEPEAK' },
                    { namePrefix: 'Vlink' },
                ],
                optionalServices: [ELM327_SERVICE_UUID, ALT_SERVICE_UUID]
            })

            this.device.addEventListener('gattserverdisconnected', () => {
                this.connected = false
                this._notifyListeners({ type: 'disconnected' })
                this._stopPolling()
            })

            // Connect to GATT server
            this.server = await this.device.gatt.connect()

            // Try primary service UUID, then alternative
            let service
            try {
                service = await this.server.getPrimaryService(ELM327_SERVICE_UUID)
            } catch {
                service = await this.server.getPrimaryService(ALT_SERVICE_UUID)
            }

            // Get characteristics
            const chars = await service.getCharacteristics()
            for (const c of chars) {
                if (c.properties.notify || c.properties.indicate) {
                    this.notifyChar = c
                }
                if (c.properties.write || c.properties.writeWithoutResponse) {
                    this.writeChar = c
                }
            }

            if (!this.writeChar || !this.notifyChar) {
                throw new Error('Required Bluetooth characteristics not found')
            }

            // Start notifications
            await this.notifyChar.startNotifications()
            this.notifyChar.addEventListener('characteristicvaluechanged', (event) => {
                const value = new TextDecoder().decode(event.target.value)
                this._handleResponse(value)
            })

            // Initialize ELM327
            await this._initELM327()

            this.connected = true
            this.mode = 'ble'
            this._notifyListeners({ type: 'connected', mode: 'ble' })

            // Start polling PIDs
            this._startPolling()

            return { success: true, mode: 'ble', deviceName: this.device.name }
        } catch (err) {
            console.error('BLE connection failed:', err)
            throw err
        }
    }

    // =============================================
    // SERIAL CONNECTION (Web Serial API)
    // =============================================

    async connectSerial(vehicleId, serverUrl = API_URL, userId = '') {
        if (!ObdBluetoothService.isWebSerialAvailable()) {
            throw new Error('Web Serial not available. Use Chrome/Edge/Opera.')
        }

        try {
            this.port = await navigator.serial.requestPort()
            await this.port.open({ baudRate: 38400 })

            this.writer = this.port.writable.getWriter()
            this.reader = this.port.readable.getReader()

            this.connected = true
            this.mode = 'serial'
            this._notifyListeners({ type: 'connected', mode: 'serial' })

            // Start reading the stream in background
            this._readSerialStream()

            // Initialize ELM327
            await this._initELM327()

            // Start polling PIDs and auto-syncing to server
            this._startPolling(vehicleId, serverUrl, userId)

            return { success: true, mode: 'serial' }
        } catch (err) {
            console.error('Serial connection failed:', err)
            throw err
        }
    }

    async _readSerialStream() {
        const decoder = new TextDecoder()
        try {
            while (this.connected && this.port.readable) {
                const { value, done } = await this.reader.read()
                if (done) break
                if (value) {
                    this._handleResponse(decoder.decode(value))
                }
            }
        } catch (err) {
            console.error('Serial read error:', err)
            this.disconnect()
        }
    }

    async _sendCommandSerial(cmd) {
        if (!this.writer) return
        const encoder = new TextEncoder()
        await this.writer.write(encoder.encode(cmd))
    }

    _handleResponse(data) {
        this.responseBuffer += data
        // ELM327 ends responses with '>'
        if (this.responseBuffer.includes('>')) {
            if (this.responseResolve) {
                this.responseResolve(this.responseBuffer)
                this.responseResolve = null
            }
            this.responseBuffer = ''
        }
    }

    async _sendCommand(cmd, timeout = 3000) {
        return new Promise((resolve, reject) => {
            this.responseBuffer = ''
            this.responseResolve = resolve

            const encoder = new TextEncoder()
            if (this.mode === 'serial') {
                this._sendCommandSerial(cmd).catch(reject)
            } else {
                this.writeChar.writeValue(encoder.encode(cmd)).catch(reject)
            }

            setTimeout(() => {
                if (this.responseResolve === resolve) {
                    this.responseResolve = null
                    resolve(this.responseBuffer || 'TIMEOUT')
                }
            }, timeout)
        })
    }

    async _initELM327() {
        for (const cmd of ELM_INIT_COMMANDS) {
            await this._sendCommand(cmd, 2000)
            await new Promise(r => setTimeout(r, 300))
        }
    }

    _parseOBDResponse(response) {
        // Clean response: remove whitespace, '>', 'SEARCHING...'
        const clean = response
            .replace(/SEARCHING\.\.\./g, '')
            .replace(/>/g, '')
            .replace(/\s/g, '')
            .trim()

        // Check for common errors
        if (clean.includes('NODATA') || clean.includes('ERROR') || clean.includes('UNABLE') || clean === '') {
            return null
        }

        // Extract hex data bytes (skip mode+pid response header)
        // Response format: 41 0C XX XX (mode 41, pid, data bytes)
        const match = clean.match(/41([0-9A-Fa-f]{2})([0-9A-Fa-f]+)/)
        if (!match) return null

        const hexData = match[2]
        const bytes = []
        for (let i = 0; i < hexData.length; i += 2) {
            bytes.push(parseInt(hexData.substring(i, i + 2), 16))
        }
        return bytes
    }

    async _readPID(pid) {
        const pidConfig = OBD_PIDS[pid]
        if (!pidConfig) return null

        try {
            const response = await this._sendCommand(pidConfig.cmd, 3000)
            const bytes = this._parseOBDResponse(response)
            if (!bytes || bytes.length === 0) return null
            return pidConfig.parse(bytes)
        } catch {
            return null
        }
    }

    async _readAllPIDs() {
        const data = {
            connected: true,
            timestamp: new Date().toISOString(),
            mode: this.mode,
            sensor: {},
            computed: {},
            monthly: {}
        }

        // Read each PID sequentially (ELM327 can only handle one at a time)
        const rpm = await this._readPID('RPM')
        const speed = await this._readPID('SPEED')
        const coolantTemp = await this._readPID('COOLANT_TEMP')
        const throttle = await this._readPID('THROTTLE_POS')
        const fuelPressure = await this._readPID('FUEL_PRESSURE')
        const fuelLevel = await this._readPID('FUEL_LEVEL')
        const voltage = await this._readPID('BATTERY_VOLTAGE')
        const maf = await this._readPID('MAF')
        const boostPressure = await this._readPID('BOOST_PRESSURE')
        const engineLoad = await this._readPID('ENGINE_LOAD')

        // Estimate tank capacity (typical car: 45-55L)
        const tankCapacity = 50
        const fuelLiters = fuelLevel !== null ? parseFloat(((fuelLevel / 100) * tankCapacity).toFixed(1)) : null

        // --- ACCURATE MILEAGE CALCULATION (MAF-BASED) ---
        // Gasoline formula: 14.7 AFR, density ~740g/L
        let avgMileage = this.lastData?.computed?.avgMileage ?? 0
        if (speed && maf && speed > 5 && maf > 0.5) {
            const fuelGps = maf / 14.7 // grams per second
            const fuelLph = (fuelGps * 3600) / 740 // liters per hour
            const instantKmL = speed / fuelLph
            
            // Apply smoothing (EMA) to prevent jumpy numbers
            if (instantKmL > 0.1 && instantKmL < 100) {
                avgMileage = parseFloat((0.1 * instantKmL + 0.9 * avgMileage).toFixed(1))
            }
        } else if (speed === 0) {
            // No movement = 0 economy
        }

        const distanceRemaining = fuelLiters !== null ? Math.round(fuelLiters * (avgMileage || 12.5)) : null

        // Accumulate odometer
        const now = Date.now()
        if (this.lastPollTime !== null && speed && speed > 0) {
            const elapsedHours = (now - this.lastPollTime) / 3600000
            this.accumulatedOdometer += speed * elapsedHours
        }
        this.lastPollTime = now
        const odometer = parseFloat(this.accumulatedOdometer.toFixed(1)) || this.lastData?.sensor?.odometer || 0

        data.sensor = {
            fuelLevel: fuelLiters ?? this.lastData?.sensor?.fuelLevel ?? 0,
            fuelPercent: fuelLevel ?? this.lastData?.sensor?.fuelPercent ?? 0,
            tankCapacity,
            speed: speed ?? this.lastData?.sensor?.speed ?? 0,
            rpm: rpm ?? this.lastData?.sensor?.rpm ?? 0,
            engineTemp: coolantTemp ?? this.lastData?.sensor?.engineTemp ?? 0,
            voltage: voltage ?? this.lastData?.sensor?.voltage ?? 12.4, // Fallback to healthy 12.4V
            odometer: odometer,
            throttle: throttle ?? 0,
            boostPressure: boostPressure ?? 0,
            fuelPressure: fuelPressure ?? 0,
            engineLoad: engineLoad ?? 0,
        }

        data.computed = {
            avgMileage,
            distanceRemaining: distanceRemaining ?? this.lastData?.computed?.distanceRemaining ?? 0,
            fuelConsumptionRate: speed > 0 ? parseFloat((fuelPressure ? fuelPressure / 50 : 7.5).toFixed(1)) : 0,
            tripDistance: this.lastData?.computed?.tripDistance ?? 0,
            tripFuelUsed: this.lastData?.computed?.tripFuelUsed ?? 0,
        }

        // Monthly data (aggregated from server or estimated)
        data.monthly = this.lastData?.monthly ?? {
            liters: 0,
            cost: 0,
            trips: 0,
            distance: 0,
            month: new Date().toLocaleString('default', { month: 'long' })
        }

        return data
    }

    async sendToServer(data, vehicleId, serverUrl, userId = '') {
        try {
            const res = await fetch(`${serverUrl}/api/obd/${vehicleId}/live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    ...data
                })
            })
            return res.ok
        } catch (err) {
            console.error('Auto-sync to server failed:', err)
            return false
        }
    }

    _startPolling(vehicleId = null, serverUrl = null, userId = null) {
        this._stopPolling()

        const poll = async () => {
            if (!this.connected) return
            try {
                const data = await this._readAllPIDs()
                this._notifyListeners({ type: 'data', data })

                // If in direct mode (BLE or Serial) AND we have server info, SYNC to server
                if ((this.mode === 'serial' || this.mode === 'ble') && vehicleId && serverUrl) {
                    await this.sendToServer(data, vehicleId, serverUrl, userId)
                }
            } catch (err) {
                console.error('OBD poll error:', err)
            }
        }

        // First read immediately
        poll()
        // Then poll every 3 seconds
        this.pollInterval = setInterval(poll, 3000)
    }

    _stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval)
            this.pollInterval = null
        }
    }

    // =============================================
    // BRIDGE MODE (Classic Bluetooth via server)
    // =============================================

    async connectBridge(vehicleId, serverUrl = API_URL, userId = '') {
        this.mode = 'bridge'
        this.connected = true
        this._notifyListeners({ type: 'connected', mode: 'bridge' })

        this._stopPolling()

        const poll = async () => {
            if (!this.connected) return
            try {
                const url = userId
                    ? `${serverUrl}/api/obd/${vehicleId}?userId=${userId}`
                    : `${serverUrl}/api/obd/${vehicleId}`
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    this._notifyListeners({ type: 'data', data })
                }
            } catch (err) {
                console.error('Bridge poll error:', err)
            }
        }

        poll()
        this.pollInterval = setInterval(poll, 3000)

        return { success: true, mode: 'bridge' }
    }

    // =============================================
    // DISCONNECT
    // =============================================

    disconnect() {
        this._stopPolling()
        this.connected = false
        this.mode = null

        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect()
        }

        this.device = null
        this.server = null
        this.writeChar = null
        this.notifyChar = null
        this.lastData = null

        if (this.reader) {
            this.reader.cancel().catch(() => {})
            this.reader.releaseLock()
            this.reader = null
        }
        if (this.writer) {
            this.writer.releaseLock()
            this.writer = null
        }
        if (this.port) {
            this.port.close().catch(() => {})
            this.port = null
        }

        this._notifyListeners({ type: 'disconnected' })
    }
}

// Singleton instance
const obdService = new ObdBluetoothService()
export default obdService
export { ObdBluetoothService }
