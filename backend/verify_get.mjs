// Using global fetch

async function verify() {
    const vehicleId = '8a9a1e2e-d0ac-4f3e-8fea-a583b95d77eb';
    try {
        const res = await fetch(`http://localhost:3001/api/obd/${vehicleId}`);
        console.log('GET status:', res.status);
        const json = await res.json();
        console.log('Response:', JSON.stringify(json, null, 2));
        
        if (json.connected) {
            console.log('✅ Live data successfully retrieved!');
        } else {
            console.log('❌ No live data retrieved. Error:', json.error);
        }
    } catch (err) {
        console.error('Verification failed:', err.message);
    }
}

verify();
