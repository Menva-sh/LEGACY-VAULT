# Executor Portal Setup - Testing Guide

## Overview
The executor portal allows users who are designated as executors to:
1. Receive a setup email with a temporary link
2. Set their password via `/executor-portal.html`
3. Login with credentials via `/executor-login.html`
4. View assigned wills on `/executor-dashboard.html`

## Step-by-Step Testing

### Step 1: Create an Executor
1. Go to: https://legacy-vault-nine.vercel.app/pages/executors.html
2. Login if needed
3. Click "Add New Executor"
4. Fill in:
   - Name: `Test Executor`
   - Email: `testexecutor@example.com`
   - (Use a real email if you want to receive the setup email)
5. Click "Create Executor"
6. ✅ You should see: "Executor designated successfully"
7. 📧 An email is sent to the executor with setup link

### Step 2: Get Setup Token (For Testing Without Email)
If you don't want to wait for email, get the token from database:

```sql
-- In Neon PostgreSQL console:
SELECT id, executor_name, executor_email, setup_token, token_expires_at, is_active
FROM executors
ORDER BY created_at DESC
LIMIT 5;
```

Copy the `setup_token` value.

### Step 3: Access Password Setup Portal
**Option A: Via Email Link** (if you have access to the email)
- Click the "Set Up Your Executor Account" button in the email
- Should take you to: `/executor-portal.html?token={setupToken}`

**Option B: Manual URL** (using token from database)
- Go to: `https://legacy-vault-nine.vercel.app/executor-portal.html?token={setupToken}`
- Replace `{setupToken}` with actual token from database

### Step 4: Set Password
1. Enter password: `TestPassword123!` (or any password meeting requirements)
2. Confirm password: `TestPassword123!`
3. Check that requirements show:
   - ✓ At least 8 characters
   - ✓ At least 1 number
   - ✓ At least 1 special character
   - ✓ Passwords match
4. Click "Set Password & Activate Account"
5. ✅ Should see: "Password set successfully! Redirecting to login..."
6. Should automatically redirect to `/executor-login.html` after 2 seconds

### Step 5: Executor Login
1. Email: `testexecutor@example.com`
2. Password: `TestPassword123!`
3. Click "Sign In"
4. ✅ Should redirect to `/executor-dashboard.html`
5. Should see: "Welcome, Test Executor!"

### Step 6: View Assigned Wills
1. Go back to main app and create a will
2. When creating the will:
   - Click "Create Will"
   - Fill in title, description, content
   - **Select "Test Executor" from the Executor dropdown**
   - Click "Create Will"
3. View the will:
   - Click "View" on the will card
   - Click "Publish Will for Executors"
   - Status should change to "published"
4. Go to executor dashboard:
   - As executor, refresh the dashboard
   - ✅ Should see the will displayed!

## Troubleshooting

### Issue: "Invalid or Expired Token"
- ✅ Token was valid 7 days ago - has expired
- ✅ Token already used - password was set before
- **Solution**: Create new executor to get fresh token

### Issue: "Password set successfully" but doesn't redirect
- Check browser console for errors (F12 → Console tab)
- May be a CORS or API connectivity issue
- Check Render logs: https://dashboard.render.com

### Issue: Login fails with "Invalid email or password"
- Verify executor exists in database with `is_active = true`
- Verify password is stored with `password` field not null
- Try creating new executor and setting password again

### Issue: No wills showing on executor dashboard
- Verify will is `status = 'published'` (not 'draft')
- Verify will has `executor_id` set to the executor's ID
- Check browser console for API errors

## Database Queries for Verification

```sql
-- Check executor details
SELECT id, executor_name, executor_email, is_active, password, setup_token
FROM executors
WHERE executor_email = 'testexecutor@example.com';

-- Check if will is assigned and published
SELECT id, title, status, executor_id, user_id
FROM digital_wills
WHERE executor_id = {executorId}
AND status = 'published';

-- Check executor activity
SELECT id, executor_name, last_login
FROM executors
WHERE is_active = true;
```

## API Endpoints Reference

**Password Setup (Public)**
```
POST /executor-auth/setup
Body: {
  setupToken: "token-from-email",
  password: "password123",
  confirmPassword: "password123"
}
Response: { message, executor: { id, email, name } }
```

**Login (Public)**
```
POST /executor-auth/login
Body: {
  email: "executor@example.com",
  password: "password123"
}
Response: { token, executor: { id, email, name, userId } }
```

**Get Assigned Wills (Protected)**
```
GET /executor-portal/wills
Headers: { Authorization: "Bearer {token}" }
Response: { wills: [...] }
```

## Expected Flow Duration
- Email delivery: 1-5 minutes
- Password setup: Immediate once clicked
- Redirect to login: 2 seconds
- Login: Immediate
- Dashboard load: 1-2 seconds

✅ All complete end-to-end should take ~5 minutes total!
