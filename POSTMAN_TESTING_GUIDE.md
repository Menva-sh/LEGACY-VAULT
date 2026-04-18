# LEGACY VAULT - Postman Testing Guide

## Setup
1. Import this as Postman **Environment Variables** or **Collection**
2. Set `base_url` = `http://localhost:3000`
3. Set `token` = (obtained from login response)

---

## 1. AUTHENTICATION

### 1.1 Register User
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123",
  "firstName": "Alice",
  "lastName": "Johnson"
}
```
**Expected Response:**
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

### 1.2 Login User
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```
**Save the token from response for next requests**

---

## 2. DIGITAL ASSETS

### 2.1 Create Asset
```
POST http://localhost:3000/assets
Content-Type: application/json
Authorization: Bearer {token}

{
  "assetName": "Cryptocurrency Wallet",
  "assetType": "cryptocurrency",
  "description": "Bitcoin and Ethereum holdings",
  "filePath": "/secure/wallets/",
  "fileSize": 2048,
  "isEncrypted": true
}
```

### 2.2 Create Another Asset
```
POST http://localhost:3000/assets
Content-Type: application/json
Authorization: Bearer {token}

{
  "assetName": "Family Photos 2024",
  "assetType": "photos",
  "description": "Important family memories",
  "filePath": "/storage/photos/2024/",
  "fileSize": 5242880,
  "isEncrypted": false
}
```

### 2.3 Get All Assets
```
GET http://localhost:3000/assets
Authorization: Bearer {token}
```

### 2.4 Get Single Asset
```
GET http://localhost:3000/assets/1
Authorization: Bearer {token}
```

### 2.5 Update Asset
```
PUT http://localhost:3000/assets/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "assetName": "Updated Asset Name",
  "description": "Updated description"
}
```

### 2.6 Delete Asset
```
DELETE http://localhost:3000/assets/1
Authorization: Bearer {token}
```

---

## 3. EXECUTORS

### 3.1 Designate Executor
```
POST http://localhost:3000/executors
Content-Type: application/json
Authorization: Bearer {token}

{
  "executorEmail": "bob@example.com",
  "executorName": "Bob Smith",
  "permissions": "view"
}
```

### 3.2 Designate Another Executor
```
POST http://localhost:3000/executors
Content-Type: application/json
Authorization: Bearer {token}

{
  "executorEmail": "charlie@example.com",
  "executorName": "Charlie Davis",
  "permissions": "edit"
}
```

### 3.3 Get All Executors
```
GET http://localhost:3000/executors
Authorization: Bearer {token}
```

### 3.4 Get Single Executor
```
GET http://localhost:3000/executors/1
Authorization: Bearer {token}
```

### 3.5 Update Executor
```
PUT http://localhost:3000/executors/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "executorName": "Updated Name",
  "permissions": "admin",
  "isActive": true
}
```

### 3.6 Approve Executor
```
PATCH http://localhost:3000/executors/1/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "approved"
}
```

### 3.7 Deny Executor
```
PATCH http://localhost:3000/executors/2/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "denied"
}
```

### 3.8 Remove Executor
```
DELETE http://localhost:3000/executors/1
Authorization: Bearer {token}
```

---

## 4. DIGITAL WILLS

### 4.1 Create Digital Will (Draft)
```
POST http://localhost:3000/wills
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "My Digital Legacy",
  "description": "Instructions for my digital assets",
  "content": "To my loved ones, I want my cryptocurrency transferred to Bob Smith. My photos should be shared with family...",
  "executorId": 1
}
```

### 4.2 Create Another Will
```
POST http://localhost:3000/wills
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Social Media Instructions",
  "description": "How to handle my social media accounts",
  "content": "My Instagram account should be memorialized. All files should be downloaded to an external drive...",
  "executorId": 1
}
```

### 4.3 Get All Wills
```
GET http://localhost:3000/wills
Authorization: Bearer {token}
```

### 4.4 Get Single Will
```
GET http://localhost:3000/wills/1
Authorization: Bearer {token}
```

### 4.5 Update Will Content
```
PUT http://localhost:3000/wills/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Legacy Instructions",
  "description": "Updated description",
  "content": "Updated will content with new instructions..."
}
```

### 4.6 Publish/Finalize Will
```
PATCH http://localhost:3000/wills/1/publish
Content-Type: application/json
Authorization: Bearer {token}

{
  "effectiveDate": "2026-12-31T00:00:00Z"
}
```

### 4.7 Delete Will (Draft Only)
```
DELETE http://localhost:3000/wills/2
Authorization: Bearer {token}
```

---

## 5. DEAD MAN'S SWITCH

### 5.1 Create Switch (30-day inactivity)
```
POST http://localhost:3000/switches
Content-Type: application/json
Authorization: Bearer {token}

{
  "triggerType": "inactivity_days",
  "triggerValue": 30,
  "actionType": "notify_executor",
  "description": "Notify executor if I'm inactive for 30 days"
}
```

### 5.2 Create Another Switch (90-day release)
```
POST http://localhost:3000/switches
Content-Type: application/json
Authorization: Bearer {token}

{
  "triggerType": "inactivity_days",
  "triggerValue": 90,
  "actionType": "release_assets",
  "description": "Release stored assets after 90 days of inactivity"
}
```

### 5.3 Get All Switches
```
GET http://localhost:3000/switches
Authorization: Bearer {token}
```

### 5.4 Get Single Switch
```
GET http://localhost:3000/switches/1
Authorization: Bearer {token}
```

### 5.5 Ping Switch (Reset Timer)
```
POST http://localhost:3000/switches/1/ping
Authorization: Bearer {token}
```

### 5.6 Update Switch
```
PUT http://localhost:3000/switches/1
Content-Type: application/json
Authorization: Bearer {token}

{
  "triggerValue": 45,
  "actionType": "notify_family",
  "description": "Updated description"
}
```

### 5.7 Manually Trigger Switch
```
POST http://localhost:3000/switches/1/trigger
Authorization: Bearer {token}
```

### 5.8 Deactivate Switch
```
PATCH http://localhost:3000/switches/1/toggle
Content-Type: application/json
Authorization: Bearer {token}

{
  "isActive": false
}
```

### 5.9 Reactivate Switch
```
PATCH http://localhost:3000/switches/1/toggle
Content-Type: application/json
Authorization: Bearer {token}

{
  "isActive": true
}
```

### 5.10 Delete Switch
```
DELETE http://localhost:3000/switches/1
Authorization: Bearer {token}
```

---

## 6. EXECUTOR PORTAL (Public Access)

### 6.1 Get Executor Dashboard
```
GET http://localhost:3000/portal/1/dashboard
Content-Type: application/json
```
**Response shows:**
- Vault owner info
- Count of accessible wills & assets
- List of wills
- List of assets

### 6.2 View Specific Will
```
GET http://localhost:3000/portal/1/wills/1
Content-Type: application/json
```
**Response:** Full will content with effective date

### 6.3 View Specific Asset
```
GET http://localhost:3000/portal/1/assets/1
Content-Type: application/json
```
**Response:** Asset details and file information

### 6.4 Get Access Logs
```
GET http://localhost:3000/portal/1/logs?limit=50
Content-Type: application/json
```
**Response:** Audit trail of all executor portal accesses

---

## Testing Workflow

### Complete User Journey:

1. **Register** → Get token
2. **Create Assets** → Upload user's digital items
3. **Designate Executors** → Add Bob & Charlie
4. **Approve Executors** → Approve Bob, Deny Charlie
5. **Create Wills** → Draft multiple wills
6. **Publish Will** → Finalize will with effective date
7. **Create Switches** → Setup 30-day & 90-day triggers
8. **Ping Switch** → Reset inactivity timer
9. **View Portal** → Access as Bob (executor)
10. **Check Logs** → View audit trail

---

## Error Testing

### Invalid Token
```
GET http://localhost:3000/assets
Authorization: Bearer invalid_token
```
Expected: 403 Forbidden

### Missing Required Fields
```
POST http://localhost:3000/assets
Authorization: Bearer {token}

{
  "assetType": "photo"
}
```
Expected: 400 Bad Request (missing assetName)

### Unauthorized Access
```
GET http://localhost:3000/assets/999
Authorization: Bearer {token}
```
Expected: 404 Not Found (asset doesn't belong to user)

---

## Tips

- Save tokens from login response for use in other requests
- Use Postman's environment variables to store `token` and `base_url`
- Test with various executorIds to simulate different executor access
- Check portal access logs to verify audit trail is working
- Switch statuses only allow: `approved`, `denied`, `deactivated`
