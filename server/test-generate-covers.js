import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { generateCovers } from './controllers/bookController.js';

dotenv.config();

const runTest = async () => {
    await connectDB();
    console.log('DB connected, simulating request...');

    const req = {}; // Mock req
    const res = {
        json: (data) => console.log('Response:', data),
        status: (code) => { console.log('Status code:', code); return res; }
    };

    try {
        await generateCovers(req, res);
    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        process.exit(0);
    }
};

runTest();
