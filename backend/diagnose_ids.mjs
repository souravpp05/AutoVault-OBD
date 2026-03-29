import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Vehicle from './models/Vehicle.js';
import User from './models/User.js';

async function list() {
    await connectDB();
    const vehicles = await Vehicle.find({}).lean();
    const users = await User.find({}).lean();
    const userMap = users.reduce((acc, u) => ({ ...acc, [u.userId]: u.username }), {});

    console.log('--- VEHICLE LIST ---');
    vehicles.forEach(v => {
        console.log(`ID: ${v.id}`);
        console.log(`Plate: ${v.plate}`);
        console.log(`Owner: ${userMap[v.userId] || 'Unknown'}`);
        console.log(`Last Updated: ${v.obdHealth?.lastUpdated}`);
        console.log('--------------------');
    });
    process.exit(0);
}

list();
