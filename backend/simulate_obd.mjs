// Using global fetch (available in Node 18+)

// Base initial states
let tripOdometer = 10;
let baseSpeed = 65;
let baseRpm = 2500;
let baseTemp = 92;
let baseVoltage = 14.1;
let fuelLevelLiters = 35;
let fuelPercent = 70;
let baseFuelPressure = 280;
let baseThrottle = 25;
let lastTime = Date.now();

let intervalId;

async function simulateFrame() {
    const vehicleId = '8a9a1e2e-d0ac-4f3e-8fea-a583b95d77eb'; // Example vehicle
    
    // Create subtle fluctuations
    const speed = Math.max(0, baseSpeed + (Math.random() * 6 - 3));
    const rpm = Math.max(800, baseRpm + (Math.random() * 200 - 100));
    const engineTemp = Math.max(80, baseTemp + (Math.random() * 2 - 1));
    const voltage = Math.max(12.0, baseVoltage + (Math.random() * 0.2 - 0.1));
    const throttle = Math.max(0, Math.min(100, baseThrottle + (Math.random() * 4 - 2)));
    const fuelPressure = baseFuelPressure + (Math.random() * 10 - 5);
    
    const now = Date.now();
    const elapsedHrs = (now - lastTime) / 3600000;
    lastTime = now;
    
    // Accumulate odometer
    tripOdometer += speed * elapsedHrs;
    
    // Slowly drain fuel based on speed and RPM
    const fuelDrain = (speed > 0) ? (speed / 100 + (rpm / 3000)) * elapsedHrs : 0;
    fuelLevelLiters -= fuelDrain;
    if (fuelLevelLiters < 0) fuelLevelLiters = 0;
    fuelPercent = (fuelLevelLiters / 50) * 100;
    
    // Estimate mileage 
    const avgMileage = speed && rpm ? parseFloat((speed / (rpm / 1000) * 2.5).toFixed(1)) : 10;

    const data = {
        connected: true,
        timestamp: new Date().toISOString(),
        vehicleId: vehicleId,
        mode: 'bridge',
        sensor: {
            rpm: Math.round(rpm),
            speed: Math.round(speed),
            engineTemp: Math.round(engineTemp),
            voltage: parseFloat(voltage.toFixed(2)),
            fuelLevel: parseFloat(fuelLevelLiters.toFixed(2)),
            fuelPercent: parseFloat(fuelPercent.toFixed(1)),
            odometer: parseFloat(tripOdometer.toFixed(2)),
            throttle: Math.round(throttle),
            fuelPressure: Math.round(fuelPressure),
            boostPressure: 0,
            engineLoad: Math.round(throttle * 0.8)
        },
        computed: {
            avgMileage: avgMileage,
            distanceRemaining: Math.round(fuelLevelLiters * avgMileage),
            tripDistance: parseFloat(tripOdometer.toFixed(2))
        }
    };

    try {
        const res = await fetch(`http://localhost:3001/api/obd/${vehicleId}/live`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log(`[SIM] Sent OBD frame | Speed: ${Math.round(speed)}km/h | RPM: ${Math.round(rpm)} | Odo: ${tripOdometer.toFixed(2)}km | V: ${voltage.toFixed(2)}V`);
    } catch (err) {
        console.error('Simulation failed:', err.message);
    }
}

// Start immediately, and run every 3 seconds
simulateFrame();
intervalId = setInterval(simulateFrame, 3000);

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down simulator...');
    clearInterval(intervalId);
    process.exit(0);
});
