# LEGACY VAULT API Documentation

## Base URL
```
http://localhost:3000
```

---

## 1. Authentication Module (`/auth`)

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response:** JWT token + user profile

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** JWT token + user profile

---

## 2. Digital Assets Module (`/assets`)
*All routes require JWT authentication (Bearer token)*

### Create Asset
- **POST** `/assets`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "assetName": "My Photo Collection",
    "assetType": "photos",
    "description": "Family photos",
    "filePath": "/uploads/photos/",
    "fileSize": 1024000,
    "isEncrypted": true
  }
  ```

### Get All Assets
- **GET** `/assets`
- **Headers:** `Authorization: Bearer {token}`

### Get Single Asset
- **GET** `/assets/{assetId}`
- **Headers:** `Authorization: Bearer {token}`

### Update Asset
- **PUT** `/assets/{assetId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "assetName": "Updated Name",
    "description": "Updated description"
  }
  ```

### Delete Asset
- **DELETE** `/assets/{assetId}`
- **Headers:** `Authorization: Bearer {token}`

---

## 3. Executor System (`/executors`)
*All routes require JWT authentication*

### Designate Executor
- **POST** `/executors`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "executorEmail": "executor@example.com",
    "executorName": "Jane Smith",
    "permissions": "view"
  }
  ```

### Get All Executors
- **GET** `/executors`
- **Headers:** `Authorization: Bearer {token}`

### Get Single Executor
- **GET** `/executors/{executorId}`
- **Headers:** `Authorization: Bearer {token}`

### Update Executor
- **PUT** `/executors/{executorId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "executorName": "Updated Name",
    "permissions": "edit",
    "isActive": true
  }
  ```

### Update Executor Status
- **PATCH** `/executors/{executorId}/status`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "status": "approved"
  }
  ```
- **Status Options:** `approved`, `denied`, `deactivated`

### Remove Executor
- **DELETE** `/executors/{executorId}`
- **Headers:** `Authorization: Bearer {token}`

---

## 4. Digital Will Generator (`/wills`)
*All routes require JWT authentication*

### Create Will
- **POST** `/wills`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "title": "My Digital Will",
    "description": "Instructions for my digital legacy",
    "content": "Full will text...",
    "executorId": 1
  }
  ```

### Get All Wills
- **GET** `/wills`
- **Headers:** `Authorization: Bearer {token}`

### Get Single Will
- **GET** `/wills/{willId}`
- **Headers:** `Authorization: Bearer {token}`

### Update Will
- **PUT** `/wills/{willId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "title": "Updated Will Title",
    "description": "Updated description",
    "content": "Updated content..."
  }
  ```

### Publish Will (Finalize)
- **PATCH** `/wills/{willId}/publish`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "effectiveDate": "2026-12-31"
  }
  ```

### Delete Will
- **DELETE** `/wills/{willId}`
- **Headers:** `Authorization: Bearer {token}`

---

## 5. Dead Man's Switch (`/switches`)
*All routes require JWT authentication*

### Create Switch
- **POST** `/switches`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "triggerType": "inactivity_days",
    "triggerValue": 30,
    "actionType": "notify_executor",
    "description": "Notify executor if inactive for 30 days"
  }
  ```

### Get All Switches
- **GET** `/switches`
- **Headers:** `Authorization: Bearer {token}`

### Get Single Switch
- **GET** `/switches/{switchId}`
- **Headers:** `Authorization: Bearer {token}`

### Update Switch
- **PUT** `/switches/{switchId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "triggerValue": 45,
    "actionType": "release_assets",
    "description": "Updated description"
  }
  ```

### Ping Switch (Reset Timer)
- **POST** `/switches/{switchId}/ping`
- **Headers:** `Authorization: Bearer {token}`

### Manually Trigger Switch
- **POST** `/switches/{switchId}/trigger`
- **Headers:** `Authorization: Bearer {token}`

### Toggle Switch Active/Inactive
- **PATCH** `/switches/{switchId}/toggle`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```

### Delete Switch
- **DELETE** `/switches/{switchId}`
- **Headers:** `Authorization: Bearer {token}`

---

## 6. Executor Portal (`/portal`)
*Portal routes for external executor access (public access for demonstration)*

### Get Executor Dashboard
- **GET** `/portal/{executorId}/dashboard`
- **Response:** Overview of wills and assets

### View Will
- **GET** `/portal/{executorId}/wills/{willId}`
- **Response:** Full will content

### View Asset
- **GET** `/portal/{executorId}/assets/{assetId}`
- **Response:** Asset details

### Get Access Logs
- **GET** `/portal/{executorId}/logs?limit=50`
- **Response:** Audit trail of executor access

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Digital Assets Table
```sql
CREATE TABLE digital_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER (FK users),
  asset_name VARCHAR(255),
  asset_type VARCHAR(50),
  description TEXT,
  file_path VARCHAR(500),
  file_size INTEGER,
  is_encrypted BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Executors Table
```sql
CREATE TABLE executors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER (FK users),
  executor_email VARCHAR(255),
  executor_name VARCHAR(255),
  permissions VARCHAR(500),
  is_active BOOLEAN,
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Digital Wills Table
```sql
CREATE TABLE digital_wills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER (FK users),
  title VARCHAR(255),
  description TEXT,
  content TEXT,
  status VARCHAR(50),
  executor_id INTEGER (FK executors),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  effective_date TIMESTAMP
);
```

### Dead Man's Switch Table
```sql
CREATE TABLE dead_mans_switch (
  id SERIAL PRIMARY KEY,
  user_id INTEGER (FK users),
  trigger_type VARCHAR(50),
  trigger_value INTEGER,
  action_type VARCHAR(50),
  description TEXT,
  is_active BOOLEAN,
  last_check TIMESTAMP,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Executor Access Logs Table
```sql
CREATE TABLE executor_access_logs (
  id SERIAL PRIMARY KEY,
  executor_id INTEGER (FK executors),
  user_id INTEGER (FK users),
  access_type VARCHAR(100),
  accessed_resource VARCHAR(255),
  accessed_at TIMESTAMP
);
```

---

## Error Handling

### Standard Error Responses

**400 Bad Request**
```json
{
  "error": "Email and password are required"
}
```

**401 Unauthorized**
```json
{
  "error": "Invalid email or password"
}
```

**403 Forbidden**
```json
{
  "error": "Invalid or expired token"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**409 Conflict**
```json
{
  "error": "Email already registered"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to retrieve resource"
}
```

---

## Security Features

✅ **Password Hashing** - bcryptjs with 10 salt rounds  
✅ **JWT Authentication** - 7-day token expiration  
✅ **SQL Injection Prevention** - Parameterized queries  
✅ **Input Validation** - Server-side validation  
✅ **CORS** - Cross-origin requests enabled  
✅ **Audit Logging** - Executor portal access tracking  

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=legacy_vault
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Run database migrations:**
   ```sql
   -- Execute all migration files in backend/migrations/
   -- 001_create_users_table.sql
   -- 002_create_digital_assets_table.sql
   -- 003_create_executors_table.sql
   -- 004_create_digital_wills_table.sql
   -- 005_create_dead_mans_switch_table.sql
   -- 006_create_executor_access_logs_table.sql
   ```

4. **Start the server:**
   ```bash
   node server.js
   ```

Server will start on `http://localhost:3000`

---

## Project Structure

```
backend/
├── db.js                    # PostgreSQL connection
├── server.js                # Express app & routes
├── package.json             # Dependencies
├── models/
│   ├── userModel.js
│   ├── assetModel.js
│   ├── executorModel.js
│   ├── willModel.js
│   ├── switchModel.js
│   └── executorPortalModel.js
├── controllers/
│   ├── authController.js
│   ├── assetController.js
│   ├── executorController.js
│   ├── willController.js
│   ├── switchController.js
│   └── executorPortalController.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── assetRoutes.js
│   ├── executorRoutes.js
│   ├── willRoutes.js
│   ├── switchRoutes.js
│   └── executorPortalRoutes.js
└── migrations/
    ├── 001_create_users_table.sql
    ├── 002_create_digital_assets_table.sql
    ├── 003_create_executors_table.sql
    ├── 004_create_digital_wills_table.sql
    ├── 005_create_dead_mans_switch_table.sql
    └── 006_create_executor_access_logs_table.sql
```
