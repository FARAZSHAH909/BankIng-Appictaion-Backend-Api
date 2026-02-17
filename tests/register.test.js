// Test script for Register and Email Verification API
// This script tests the registration and email verification endpoints

const BASE_URL = 'http://localhost:8000/api/auth';

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', body = null, params = null) {
    let url = `${BASE_URL}${endpoint}`;

    if (params) {
        const urlParams = new URLSearchParams(params);
        url += `?${urlParams.toString()}`;
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

// Test data
const testUser = {
    username: 'testuser' + Date.now(),
    email: `testuser${Date.now()}@example.com`,
    password: 'Test123456'
};

console.log('🚀 Starting API Tests...\n');

// Test 1: Register a new user
async function testRegister() {
    console.log('📝 Test 1: Register New User');
    console.log('Request:', testUser);

    const result = await makeRequest('/register', 'POST', testUser);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 201) {
        console.log('✅ Registration successful!\n');
        return true;
    } else {
        console.log('❌ Registration failed!\n');
        return false;
    }
}

// Test 2: Try to register duplicate user
async function testDuplicateRegister() {
    console.log('📝 Test 2: Register Duplicate User');
    console.log('Request:', testUser);

    const result = await makeRequest('/register', 'POST', testUser);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 409) {
        console.log('✅ Duplicate check working!\n');
        return true;
    } else {
        console.log('❌ Duplicate check failed!\n');
        return false;
    }
}

// Test 3: Verify email with OTP (Manual - requires actual OTP from email)
async function testVerifyEmail(otp) {
    console.log('📝 Test 3: Verify Email with OTP');
    const verifyData = {
        email: testUser.email,
        otp: otp
    };
    console.log('Request:', verifyData);

    const result = await makeRequest('/verify-email', 'POST', verifyData);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 200) {
        console.log('✅ Email verification successful!\n');
        return true;
    } else {
        console.log('❌ Email verification failed!\n');
        return false;
    }
}

// Test 4: Verify with invalid OTP
async function testInvalidOTP() {
    console.log('📝 Test 4: Verify Email with Invalid OTP');
    const verifyData = {
        email: testUser.email,
        otp: '000000'
    };
    console.log('Request:', verifyData);

    const result = await makeRequest('/verify-email', 'POST', verifyData);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 400) {
        console.log('✅ Invalid OTP check working!\n');
        return true;
    } else {
        console.log('❌ Invalid OTP check failed!\n');
        return false;
    }
}

// Test 5: Register with missing fields
async function testMissingFields() {
    console.log('📝 Test 5: Register with Missing Fields');
    const invalidUser = {
        username: 'testuser',
        email: 'test@example.com'
        // password missing
    };
    console.log('Request:', invalidUser);

    const result = await makeRequest('/register', 'POST', invalidUser);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 400) {
        console.log('✅ Validation working!\n');
        return true;
    } else {
        console.log('❌ Validation failed!\n');
        return false;
    }
}

// Test 6: Verify email with GET request (for email links)
async function testVerifyEmailGET(email, otp) {
    console.log('📝 Test 6: Verify Email with GET request (Email Link)');
    const params = { email, otp };
    console.log('Params:', params);

    const result = await makeRequest('/verify-email', 'GET', null, params);

    console.log('Status:', result.status);
    console.log('Response:', result.data);

    if (result.status === 200 || result.status === 400 || result.status === 404) {
        console.log('✅ GET request reaching server!\n');
        return true;
    } else {
        console.log('❌ GET request failed to reach correctly!\n');
        return false;
    }
}

// Run all tests
async function runTests() {
    try {
        // Automated tests
        await testRegister();
        await testDuplicateRegister();
        await testMissingFields();
        await testInvalidOTP();

        // Test GET support
        await testVerifyEmailGET('nonexistent@test.com', '123456');

        console.log('\n⚠️  MANUAL TEST REQUIRED:');
        console.log('To complete the verification test:');
        console.log('1. Check the email:', testUser.email);
        console.log('2. Get the OTP code from the email');
        console.log('3. Run: node tests/register.test.js <OTP_CODE>');
        console.log('\nOr test manually with curl:');
        console.log(`curl -X POST ${BASE_URL}/verify-email \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"email":"${testUser.email}","otp":"YOUR_OTP_HERE"}'`);

        console.log('\nOr test GET manually:');
        console.log(`curl "${BASE_URL}/verify-email?email=${testUser.email}&otp=YOUR_OTP_HERE"`);

        // If OTP is provided as command line argument
        if (process.argv[2]) {
            console.log('\n📝 Running manual OTP verification test...');
            await testVerifyEmail(process.argv[2]);
        }

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run the tests
runTests();
