import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import { connectDB } from './db.js';

async function fixMaintenance() {
    try {
        await connectDB();
        
        const targetValue = 2979705;
        const allVehicles = await Vehicle.find({});
        let found = false;

        for (const vehicle of allVehicles) {
            let updated = false;
            
            // Check obdHealth fields
            if (vehicle.obdHealth) {
                if (Math.floor(vehicle.obdHealth.odometer) === targetValue) {
                    vehicle.obdHealth.odometer = 0;
                    updated = true;
                }
                if (Math.floor(vehicle.obdHealth.lastServiceKm) === targetValue) {
                    vehicle.obdHealth.lastServiceKm = 0;
                    updated = true;
                }
                // etc.
            }

            // Check maintenance fields
            if (vehicle.maintenance) {
                if (Math.floor(vehicle.maintenance.nextServiceKm) === targetValue) {
                    vehicle.maintenance.nextServiceKm = 0;
                    updated = true;
                }
                if (Math.floor(vehicle.maintenance.nextOilChangeKm) === targetValue) {
                    vehicle.maintenance.nextOilChangeKm = 0;
                    updated = true;
                }
                if (Math.floor(vehicle.maintenance.nextTyreChangeKm) === targetValue) {
                    vehicle.maintenance.nextTyreChangeKm = 0;
                    updated = true;
                }
            }

            if (updated) {
                await vehicle.save();
                console.log(`✅ Fixed fields in vehicle: ${vehicle.id}`);
                found = true;
            }
        }

        if (!found) {
            console.log('❌ No more fields found with value', targetValue);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fixMaintenance();
