import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const uploadUrl = process.env.N8N_WEBHOOK_UPLOAD;
const inviteUrl = process.env.N8N_WEBHOOK_SEND_MAIL;

console.log('Testing N8N Connectivity...');
console.log('Upload URL:', uploadUrl);
console.log('Invite URL:', inviteUrl);

async function testUrl(url: string | undefined, name: string) {
    if (!url) {
        console.error(`❌ ${name} URL is missing in .env`);
        return;
    }

    try {
        console.log(`\nTesting ${name} (${url})...`);
        // We expect a 404 or 400 or similar because we aren't sending valid data, 
        // but a connection error (ECONNREFUSED, ENOTFOUND) is what we are looking for.
        // Using GET might trigger a 404 or Method Not Allowed, which proves connectivity.
        const response = await axios.get(url, { timeout: 5000, validateStatus: () => true });
        console.log(`✅ ${name} Connected! Status: ${response.status}`);
        console.log('Response headers:', response.headers);
    } catch (error: any) {
        console.error(`❌ ${name} Connection Failed:`);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. Network error?');
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            console.error('Error cause:', error.cause);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
}

async function run() {
    await testUrl(uploadUrl, 'Upload Webhook (Axios)');
    await testUrl(inviteUrl, 'Invite Webhook (Axios)');

    console.log('\n--- Testing with global fetch ---');
    try {
        if (inviteUrl) {
            const res = await fetch(inviteUrl, { method: 'GET' });
            console.log(`✅ Fetch Invite Success: ${res.status}`);
        }
    } catch (e: any) {
        console.error(`❌ Fetch Invite Failed: ${e.message}`);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

run();
