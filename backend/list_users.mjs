import mongoose from 'mongoose';
import User from './models/User.js';
import { connectDB } from './db.js';

async function listUsers() {
    try {
        await connectDB();
        const users = await User.find({}, 'username userId email');
        console.log('Registered Users:');
        users.forEach(u => console.log(`- Username: ${u.username}, ID: ${u.userId}, Email: ${u.email}`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
