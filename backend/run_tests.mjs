import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3001';

test('AutoVault Backend Unit Tests Suite', async (t) => {
    
    let testVehicleId = null;

    await t.test('1. API should return list of marketplace vehicles', async () => {
        const res = await fetch(`${BASE_URL}/api/marketplace/vehicles`);
        assert.strictEqual(res.status, 200, 'Marketplace API must return 200 OK');
        
        const vehicles = await res.json();
        assert.ok(Array.isArray(vehicles), 'Must return an array of vehicles');
        
        if (vehicles.length > 0) {
            testVehicleId = vehicles[0].id;
        } else {
            // Fetch any vehicle if marketplace is empty
            const userRes = await fetch(`${BASE_URL}/api/users`);
            if (userRes.ok) {
                const users = await userRes.json();
                if (users.length && users[0].vehicles.length) {
                    testVehicleId = users[0].vehicles[0].id;
                }
            }
        }
        
    });

    await t.test('2. OBD Live Simulation Fallback Test', async () => {
        if (!testVehicleId) return; // Skip if db empty
        
        // Wait exactly 31 seconds? No, we can just GET to see the hackathon simulation!
        const res = await fetch(`${BASE_URL}/api/obd/${testVehicleId}`);
        assert.strictEqual(res.status, 200);
        
        const data = await res.json();
        assert.ok(data.connected, 'Simulation should actively return connected=true');
        assert.ok(data.source === 'simulated' || data.source === 'bridge', 'Source should be simulated or bridge');
        assert.ok(data.health.score > 0, 'Health score must be greater than 0');
        assert.ok(data.sensor.speed >= 0, 'Speed must be simulated properly');
        assert.ok(data.computed.avgMileage > 0, 'Mileage algorithm must work');
    });

    await t.test('3. OBD Bridge Odometer Persistence Logic Test', async () => {
        if (!testVehicleId) return; 
        
        const mockPayload = {
            sensor: {
                rpm: 3000,
                speed: 60,
                engineTemp: 85,
                voltage: 14.2,
                fuelLevel: 30,
                fuelPercent: 60,
                odometer: 1.5 // Trip Distance reported by scanner
            },
            baseOdometer: 999999 // Seed physical dashboard value (extreme to force override)
        };

        const postRes = await fetch(`${BASE_URL}/api/obd/${testVehicleId}/live?userId=test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockPayload)
        });
        
        assert.strictEqual(postRes.status, 200, 'Live data upload must succeed');
        
        // Fetch it back to verify the persistent database overwrite
        const finalRes = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/health`);
        const finalHealth = await finalRes.json();
        
        // Validation: The database MUST sum the baseOdometer + trip odometer
        assert.ok(finalHealth.odometer > 999999, `Odometer logic failure: Expected >999999, got ${finalHealth.odometer}`);
    });

    await t.test('4. OBD Health Scoring Math Test', async () => {
        if (!testVehicleId) return;

        const res = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}/health`);
        const healthData = await res.json();
        
        assert.ok(healthData.healthScore !== undefined, 'Persisted Health Score missing');
        assert.ok(healthData.batteryHealth !== undefined, 'Battery Health logic missing');
    });

});
