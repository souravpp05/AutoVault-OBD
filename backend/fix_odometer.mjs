import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import { connectDB } from './db.js';

async function fixOdometer() {
    try {
        await connectDB();
        
        // Find vehicle with the specific odometer reading
        const vehicle = await Vehicle.findOne({ 'obdHealth.odometer': 2979705 });
        
        if (vehicle) {
            console.log(`Found vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.id})`);
            vehicle.obdHealth.odometer = 0;
            vehicle.obdHealth._lastBridgeOdometer = 0;
            await vehicle.save();
            console.log('✅ Odometer reading reset to 0.');
        } else {
            const allVehicles = await Vehicle.find({});
            const target = allVehicles.find(v => v.obdHealth && Math.floor(v.obdHealth.odometer) === 2979705);
            if (target) {
                console.log(`Found vehicle (approx match): ${target.make} ${target.model} (${target.id})`);
                target.obdHealth.odometer = 0;
                target.obdHealth._lastBridgeOdometer = 0;
                await target.save();
                console.log('✅ Odometer reading reset to 0.');
            } else {
                console.log('❌ Could not find vehicle with odometer 2979705.');
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fixOdometer();
