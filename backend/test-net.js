fetch('http://127.0.0.1:3001/api/marketplace/vehicles').then(r => console.log(r.status)).catch(e => console.log(e.message))
fetch('http://localhost:3001/api/marketplace/vehicles').then(r => console.log(r.status)).catch(e => console.log(e.message))
