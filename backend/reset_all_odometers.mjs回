import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import { connectDB } from './db.js';

async function resetAllOdometers() {
    try {
        await connectDB();
        
        const result = await Vehicle.updateMany(
            {},
            { 
                $set: { 
                    'obdHealth.odometer': 0,
                    'obdHealth._lastBridgeOdometer': 0
                } 
            }
        );
        
        console.log(`✅ Successfully reset odometer for ${result.modifiedCount} vehicles.`);
    } catch (err) {
        console.error('Error during reset:', err);
    } finally {
        await mongoose.disconnect();
    }
}

resetAllOdometers();
