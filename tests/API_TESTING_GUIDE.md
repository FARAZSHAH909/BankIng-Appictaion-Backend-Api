## API Testing Guide

### Available Endpoints

#### 1. Register User
**POST** `/api/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "message": "User johndoe registered successfully. Please check your email for the OTP code.",
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": false
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists
- `500` - Internal server error

---

#### 2. Verify Email
**POST** `/api/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**Error Responses:**
- `400` - Missing fields / Invalid OTP / OTP expired / Already verified
- `404` - User not found
- `500` - Internal server error

---

### Testing with cURL

#### Test 1: Register a new user
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

#### Test 2: Verify email with OTP
```bash
curl -X POST http://localhost:3000/api/verify-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"otp\":\"YOUR_OTP_HERE\"}"
```

#### Test 3: Try duplicate registration
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

---

### Testing with PowerShell

#### Test 1: Register a new user
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -Body $body -ContentType "application/json"
```

#### Test 2: Verify email with OTP
```powershell
$body = @{
    email = "test@example.com"
    otp = "YOUR_OTP_HERE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/verify-email" -Method POST -Body $body -ContentType "application/json"
```

---

### Testing with Postman

1. **Register User:**
   - Method: POST
   - URL: `http://localhost:3000/api/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "Test123456"
     }
     ```

2. **Verify Email:**
   *Option A: POST Request (API Style)*
   - Method: POST
   - URL: `http://localhost:8000/api/auth/verify-email`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "otp": "123456"
     }
     ```

   *Option B: GET Request (Simulate Email Link)*
   - Method: GET
   - URL: `http://localhost:8000/api/auth/verify-email?email=test@example.com&otp=123456`
   - Headers: None required
   - Body: None

---

### Expected Flow

1. **Register** → User receives OTP via email (valid for 10 minutes)
2. **Check Email** → Get the 6-digit OTP code
3. **Verify** → Submit email + OTP to verify account
4. **Success** → User's `isVerified` status changes to `true`

---

### Environment Variables Required

Make sure your `.env` file contains:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
MONGODB_URI=your-mongodb-connection-string
PORT=3000
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.
