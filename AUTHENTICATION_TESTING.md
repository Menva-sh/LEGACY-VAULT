# ✅ LEGACY VAULT - Authentication API Testing Guide

## Server Status
- ✅ Server running on `http://localhost:3000`
- ✅ PostgreSQL connected
- ✅ All routes loaded

---

## 📮 POSTMAN TESTING COMPLETE

### 1. Registration Test

**Method:** POST  
**URL:** http://localhost:3000/auth/register  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123",
  "firstName": "Alice",
  "lastName": "Johnson"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Johnson"
  }
}
```

---

### 2. Login Test

**Method:** POST  
**URL:** http://localhost:3000/auth/login  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Johnson"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value from the response. You'll need it for protected routes.

---

### 3. Protected Route Test - Dashboard

**Method:** GET  
**URL:** http://localhost:3000/dashboard-test  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN_HERE}
```

**Example with real token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsImlhdCI6MTcxMjAyNjAwMCwiZXhwIjoxNzEyNjMwODAwfQ...
```

**Expected Response (200 OK):**
```json
{
  "message": "Welcome to protected dashboard",
  "user": {
    "id": 1,
    "email": "alice@example.com"
  },
  "timestamp": "2026-04-14T10:30:00.000Z"
}
```

---

### 4. Test Without Token (Should Fail)

**Method:** GET  
**URL:** http://localhost:3000/dashboard-test  
**Headers:**
```
Content-Type: application/json
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "No token provided"
}
```

---

### 5. Test With Invalid Token (Should Fail)

**Method:** GET  
**URL:** http://localhost:3000/dashboard-test  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer invalid_token_12345
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Invalid or expired token"
}
```

---

## 🎯 Complete Testing Workflow in Postman

### Step 1: Register User
1. Create new POST request
2. URL: `http://localhost:3000/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "alice@example.com",
     "password": "password123",
     "firstName": "Alice",
     "lastName": "Johnson"
   }
   ```
5. Click **Send**
6. Copy the `token` from the response

### Step 2: Create Postman Environment Variable
1. Click **Environments** (bottom left)
2. Create new environment: `LEGACY VAULT`
3. Add variable:
   - Name: `token`
   - Value: (paste the token from Step 1)
4. Set active environment: click the dropdown top-right, select `LEGACY VAULT`

### Step 3: Test Protected Route
1. Create new GET request
2. URL: `http://localhost:3000/dashboard-test`
3. Headers tab:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
4. Click **Send** - should work! 🎉

### Step 4: Test Without Token (Verify Security)
1. Remove the Authorization header
2. Click **Send** - should get error  "No token provided"

### Step 5: Test With Invalid Token (Verify Validation)
1. Header: `Authorization: Bearer invalid123`
2. Click **Send** - should get error "Invalid or expired token"

---

## 📊 Test Matrix

| Test | Method | URL | Auth | Expected Status |
|------|--------|-----|------|-----------------|
| Register | POST | /auth/register | ❌ No | 201 Created |
| Login | POST | /auth/login | ❌ No | 200 OK |
| Dashboard (with token) | GET | /dashboard-test | ✅ Token | 200 OK |
| Dashboard (no token) | GET | /dashboard-test | ❌ None | 401 Unauthorized |
| Dashboard (bad token) | GET | /dashboard-test | ⚠️ Invalid | 403 Forbidden |

---

## ✅ Verification Checklist

- [x] Server running on port 3000
- [x] PostgreSQL connected
- [x] All routes loaded
- [x] /auth/register endpoint ready
- [x] /auth/login endpoint ready
- [x] /dashboard-test protected route ready
- [x] JWT token generation working
- [x] Token validation middleware active

---

## 🔐 Database Setup Required

Before testing, make sure the `users` table exists in PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 🐛 Troubleshooting

### Issue: "Cannot POST /auth/register"
- ✅ Server is running
- ❌ Check that Content-Type header is set to `application/json`
- ❌ Verify the request body is valid JSON
- ❌ Make sure you're not sending as `form-data`

### Issue: "Email already registered"
- Register with a different email
- Or check database and delete test user:
  ```sql
  DELETE FROM users WHERE email = 'alice@example.com';
  ```

### Issue: "Invalid email or password"
- Make sure you're using correct credentials
- Check for typos in email
- Note that passwords ARE case-sensitive

### Issue: "No token provided"
- You're accessing a protected route without Authorization header
- Add header: `Authorization: Bearer {token}`

### Issue: "Invalid or expired token"
- Token might have expired (7-day expiration)
- Register/login again to get fresh token
- Check that token is copied completely (no extra spaces)

---

## 📝 Sample Successful Flow

```
1. POST /auth/register
   ↓ (get token: abcd123...)
   
2. Store token in Postman variable {{token}}
   ↓
   
3. GET /dashboard-test with header: Authorization: Bearer abcd123...
   ↓ (get 200 OK with user data)
   
4. ✅ Authentication system is working!
```

---

## Next Steps After Verification

Once authentication is confirmed working:
- [ ] Test Digital Assets endpoints
- [ ] Test Executor System endpoints
- [ ] Test Digital Will endpoints
- [ ] Test Dead Man's Switch endpoints
- [ ] Test Executor Portal endpoints

---

## 📞 Support

If tests aren't working:
1. Verify `.env` file has correct database credentials
2. Confirm server output shows "Connected to PostgreSQL"
3. Check that all migration SQL files have been run
4. Restart the server and try again
5. Review server console for error messages

✨ **Happy Testing!**
