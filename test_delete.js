async function testDelete() {
    try {
        // Need to login first to get the token
        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin@hotel.com', // fallback
                password: 'password123' // fallback
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        
        // Try deleting order 19
        const delRes = await fetch('http://localhost:8080/api/orders/19', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!delRes.ok) {
            const errorData = await delRes.json();
            console.log("Error status:", delRes.status);
            console.log("Error data:", errorData);
        } else {
            console.log("Success:", delRes.status);
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testDelete();
