// Using global fetch
async function test() {
    const vehicleId = '8a9a1e2e-d0ac-4f3e-8fea-a583b95d77eb';
    const data = {
        connected: true,
        timestamp: new Date().toISOString(),
        vehicleId: vehicleId,
        mode: 'bridge',
        sensor: {
            rpm: 3000,
            speed: 70,
            engineTemp: 85,
            voltage: 14.1,
            fuelLevel: 40,
            fuelPercent: 80,
            odometer: 15
        }
    };

    console.log('Sending POST...');
    const postRes = await fetch(`http://localhost:3001/api/obd/${vehicleId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    console.log('POST status:', postRes.status);

    console.log('Fetching GET immediately...');
    const getRes = await fetch(`http://localhost:3001/api/obd/${vehicleId}`);
    console.log('GET status:', getRes.status);
    const json = await getRes.json();
    console.log('Response:', JSON.stringify(json, null, 2));
}

test();
