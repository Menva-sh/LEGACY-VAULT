# 🧪 LEGACY VAULT - Complete Testing Instructions

> **Status**: ✅ All modules built and integrated  
> **Server**: ✅ Running on port 3000  
> **Database**: Ready for initialization

---

## 📋 Pre-Testing Checklist

### 1. Database Setup (CRITICAL)
You must initialize the database before testing. Run this SQL in PostgreSQL:

```bash
# Using psql or pgAdmin, execute all migration files:
psql -U postgres -d legacy_vault -f backend/migrations/001_create_users_table.sql
psql -U postgres -d legacy_vault -f backend/migrations/002_create_digital_assets_table.sql
psql -U postgres -d legacy_vault -f backend/migrations/003_create_executors_table.sql
psql -U postgres -d legacy_vault -f backend/migrations/004_create_digital_wills_table.sql
psql -U postgres -d legacy_vault -f backend/migrations/005_create_dead_mans_switch_table.sql
psql -U postgres -d legacy_vault -f backend/migrations/006_create_executor_access_logs_table.sql
```

Or copy-paste this entire SQL script into pgAdmin or psql:
See `backend/migrations/INIT_DATABASE.sql`.

### 2. Environment Variables
Make sure `.env` file exists in `backend/` with:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=legacy_vault
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_change_in_production
```

### 3. Server Status
Verify server is running:
```bash
cd backend
node server.js
```

Expected output:
```
◇ injected env...
Loading auth routes...
Loading asset routes...
Loading executor routes...
Loading will routes...
Loading switch routes...
Loading portal routes...
All routes loaded successfully
Server running on port 3000
Connected to PostgreSQL
```

---

## ✅ API Testing Guide

### **STEP 1: Test Registration**

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/auth/register`
- Header: `Content-Type: application/json`
- Body (raw):
```json
{
  "email": "testuser@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Response (Status 201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN...",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

**⚠️ SAVE THIS TOKEN** - You'll need it for protected routes!

---

### **STEP 2: Test Login**

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/auth/login`
- Header: `Content-Type: application/json`
- Body (raw):
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Expected Response (Status 200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN...",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

### **STEP 3: Setup Postman Environment**

Store the token in a Postman environment variable:

1. Click **Manage Environments** (or gear icon)
2. Create new environment: `LegacyVault`
3. Add variable:
   - Name: `api_token`
   - Value: `<paste your token from login>`
4. Save and select environment from dropdown

---

### **STEP 4: Test Protected Route (Dashboard)**

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/dashboard-test`
- Header `Authorization`: `Bearer {{api_token}}`
- Header `Content-Type`: `application/json`

**Expected Response (Status 200):**
```json
{
  "message": "Welcome to protected dashboard",
  "user": {
    "id": 1,
    "email": "testuser@example.com"
  },
  "timestamp": "2026-04-14T14:23:45.123Z"
}
```

✅ **If this works, authentication is working!**

---

### **STEP 5: Test Security (Missing Token)**

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/dashboard-test`
- Remove Authorization header

**Expected Response (Status 401):**
```json
{
  "error": "No token provided"
}
```

✅ **Security is working!**

---

### **STEP 6: Test Security (Invalid Token)**

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/dashboard-test`
- Header `Authorization`: `Bearer invalid_token_12345`

**Expected Response (Status 403):**
```json
{
  "error": "Invalid or expired token"
}
```

✅ **Token validation is working!**

---

## 🎯 Complete Testing Checklist

- [ ] Database tables created
- [ ] `.env` file configured
- [ ] Server running and showing "Connected to PostgreSQL"
- [ ] Registration returns 201 with token
- [ ] Login returns 200 with token
- [ ] Protected route returns 200 with token
- [ ] Protected route returns 401 without token
- [ ] Protected route returns 403 with invalid token

---

## 📞 Troubleshooting

### "Cannot POST /auth/register" (404 Error)
**Causes:**
1. Database tables don't exist → Run migration SQL scripts
2. Routes not loading → Check server console for errors
3. Wrong URL → Make sure it's exactly `http://localhost:3000/auth/register`

**Fix:**
```bash
# Terminal 1: Check server logs
node server.js

# Terminal 2: Run migrations
psql -U postgres -d legacy_vault -f backend/migrations/001_create_users_table.sql
```

### "Error creating user: Connection refused"
**Cause:** PostgreSQL not connected

**Fix:**
1. Verify PostgreSQL is running
2. Check `.env` credentials
3. Verify database `legacy_vault` exists:
   ```sql
   CREATE DATABASE legacy_vault;
   ```

### "Email already registered"
**Cause:** User already exists in database

**Fix:**
```bash
# In Postman, use a different email:
"email": "testuser2@example.com"

# Or clear the database:
# In PostgreSQL:
DELETE FROM users WHERE email = 'testuser@example.com';
```

### "Invalid email or password"
**Cause:** Wrong credentials

**Fix:**
- Make sure email and password match exactly (case-sensitive)
- Verify spelling

---

## 🔄 Testing Flow Summary

```
START
   │
   ├─→ Register User (POST /auth/register)
   │   └─→ Get JWT token
   │
   ├─→ Save token in Environment variable
   │   └─→ Variable: {{api_token}}
   │
   ├─→ TEST: With Token (GET /dashboard-test with {{api_token}})
   │   └─→ Should return 200 OK ✅
   │
   ├─→ TEST: Without Token (GET /dashboard-test, NO header)
   │   └─→ Should return 401 ✅
   │
   ├─→ TEST: Invalid Token (GET /dashboard-test with "Bearer invalid")
   │   └─→ Should return 403 ✅
   │
   └─→ ✅ Authentication Complete!
```

---

## 📊 API Endpoints Ready

### Authentication (No Auth Required)
```
POST   /auth/register          (Register new user)
POST   /auth/login             (Login user)
```

### Digital Assets (Auth Required)
```
POST   /assets                 (Create asset)
GET    /assets                 (Get all assets)
GET    /assets/:id             (Get single asset)
PUT    /assets/:id             (Update asset)
DELETE /assets/:id             (Delete asset)
```

### Executors (Auth Required)
```
POST   /executors              (Designate executor)
GET    /executors              (Get all executors)
GET    /executors/:id          (Get single executor)
PUT    /executors/:id          (Update executor)
PATCH  /executors/:id/status   (Change status)
DELETE /executors/:id          (Remove executor)
```

### Digital Wills (Auth Required)
```
POST   /wills                  (Create will)
GET    /wills                  (Get all wills)
GET    /wills/:id              (Get single will)
PUT    /wills/:id              (Update will)
PATCH  /wills/:id/publish      (Publish will)
DELETE /wills/:id              (Delete will)
```

### Dead Man's Switch (Auth Required)
```
POST   /switches               (Create switch)
GET    /switches               (Get all switches)
GET    /switches/:id           (Get single switch)
PUT    /switches/:id           (Update switch)
POST   /switches/:id/ping      (Reset timer)
POST   /switches/:id/trigger   (Manual trigger)
PATCH  /switches/:id/toggle    (Activate/Deactivate)
DELETE /switches/:id           (Delete switch)
```

### Executor Portal (No Auth)
```
GET    /portal/:executorId/dashboard        (Dashboard)
GET    /portal/:executorId/wills/:willId    (View will)
GET    /portal/:executorId/assets/:assetId  (View asset)
GET    /portal/:executorId/logs             (Access logs)
```

---

## ✨ Next Steps After Authentication Works

1. **Test Digital Assets endpoints** (with token)
2. **Test Executor System endpoints** (with token)
3. **Test Digital Will endpoints** (with token)
4. **Test Dead Man's Switch endpoints** (with token)
5. **Build Frontend** to consume these APIs

---

## 📚 Documentation Files

- `API_DOCUMENTATION.md` - Complete API reference
- `POSTMAN_TESTING_GUIDE.md` - Detailed Postman examples
- `PROJECT_SUMMARY.md` - Full system overview
- `AUTHENTICATION_TESTING.md` - Auth testing guide
- This file

---

## ✅ Verification Command

To verify all is set up, run this in terminal:

```bash
curl -X GET http://localhost:3000/
# Should return: "LegacyVault API Running"

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"Test","lastName":"User"}'
# Should return: User created with token
```

---

**Ready to test! 🚀**
