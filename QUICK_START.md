# QUICK START GUIDE - LEGACY VAULT

## Status: ✅ System Fixed & Running

### What Was Fixed
1. **Data Disappearing** - Database was being reset on each restart → FIXED
2. **Creation Errors** - Related to data not persisting → FIXED

---

## 🚀 How to Use Right Now

### Access the System
```
Frontend:  http://localhost:8080
Backend:   http://localhost:3000
Database:  PostgreSQL (connected)
```

### Step 1: Register & Login
1. Open http://localhost:8080 in your browser
2. Click "Register" and create an account
3. Login with your credentials
4. You'll be redirected to the Dashboard

### Step 2: Create Data
From the Dashboard, you can:
- **Assets**: Add photos, documents, crypto accounts, etc.
- **Executors**: Designate who can manage your digital estate
- **Wills**: Create digital will documents
- **Switches**: Set up Dead Man's Switch for automated access

### Step 3: Verify Persistence
1. Create something (e.g., add an asset)
2. Refresh the page - data still there ✅
3. Stop backend (Ctrl+C in terminal)
4. Restart backend (run `npm start` again)
5. Refresh page - data still there ✅

---

## 📋 Running the System

### Terminal 1: Backend
```bash
cd backend
npm start
```
Should show: `✅ Using existing database (data will persist)`

### Terminal 2: Frontend
```bash
cd frontend
node server.js
```
Should show: `Frontend: http://localhost:8080`

---

## 🎯 Features Working

### ✅ Asset Management
- Create digital assets (photos, documents, accounts)
- Edit asset details
- Delete assets
- List all assets with encryption status
- All data persists

### ✅ Executor Management  
- Add executors who will manage your estate
- Set permissions/roles
- View executor list
- Update executor status
- All changes saved to database

### ✅ Digital Wills
- Create text-based digital will documents
- Generate PDF versions
- Assign executors to wills
- Publish wills with effective dates
- Download as PDF

### ✅ Dead Man's Switch
- Set inactivity threshold (days)
- Automatically triggers executor access
- Runs daily at 2:00 AM UTC
- Tracks user login activity
- Manual test endpoint available

---

## 🛠️ Troubleshooting

### Data still disappearing?
1. Check backend startup message
2. Must say: `✅ Using existing database (data will persist)`
3. If it says "Executed" for all migrations, restart once more
4. Second restart should show "Skipped" messages

### Can't create assets?
1. Make sure you're logged in (JWT token in browser)
2. Check browser DevTools (F12) → Console tab for errors
3. Look at Network tab: POST /assets request should get 201 response
4. Backend logs should show asset creation details

### Servers won't start?
```bash
# Check if port is in use:
netstat -ano | findstr :3000

# Kill process if needed (replace PID):
taskkill /PID <PID> /F

# Restart:
npm start
```

### Can't access frontend?
- Make sure frontend server is running: `node server.js` (port 8080)
- Clear browser cache: Ctrl+Shift+Delete
- Try incognito/private mode

---

## 💾 Data Persistence (NEW!)

### How It Works
- **Before**: Database reset on every restart → data lost
- **Now**: Migrations tracked → only new migrations run → data safe

### Database Status
All tables created and tracked:
```
✅ 001_create_users_table.sql
✅ 002_create_digital_assets_table.sql  
✅ 003_create_executors_table.sql
✅ 004_create_digital_wills_table.sql
✅ 005_create_dead_mans_switch_table.sql
✅ 006_create_executor_access_logs_table.sql
✅ 007_add_file_path_to_wills.sql
✅ 008_add_last_active_to_users.sql
✅ 009_add_status_to_dead_mans_switch.sql
```

---

## 📝 Common Tasks

### Create a Digital Asset
1. Login
2. Click "Assets" in sidebar
3. Click "Add Asset" button
4. Fill in:
   - Asset Name (required)
   - Type (photos, documents, etc.)
   - Description
   - File path (optional)
   - File size (optional)
   - Encrypted (checkbox)
5. Click "Create Asset"
6. Asset appears in list immediately

### Add an Executor
1. Click "Executors" in sidebar
2. Click "Add Executor" button
3. Fill in:
   - Executor Name (required)
   - Email (required)
   - Permissions (optional)
4. Click "Create"
5. Executor added to list

### Generate Digital Will
1. Click "Wills" in sidebar
2. Click "Create Will" button
3. Fill in:
   - Title (required)
   - Description
   - Content (main will text)
   - Select executor
4. Click "Create Will"
5. Click "Generate PDF" to download

### Setup Dead Man's Switch
1. Click "Switches" in sidebar
2. Click "Create Switch" button
3. Set:
   - Trigger Value (days of inactivity)
   - Action Type (what happens when triggered)
4. Click "Create"
5. System will auto-trigger if inactive for X days

---

## 🔐 Security Notes

- Authentication: JWT tokens in localStorage
- All API requests require valid token
- Passwords hashed before storage
- CORS enabled for localhost:8080
- Database isolated per user

---

## 📞 Support

If you encounter errors:

1. **Check Terminal Logs**
   - Backend terminal shows detailed errors
   - Look for lines starting with "❌"

2. **Check Browser Console**
   - Press F12 in browser
   - Check Console tab for JavaScript errors
   - Check Network tab for failed API calls

3. **Check Network Requests**
   - F12 → Network tab
   - Perform action (create asset, etc.)
   - Look for red failed requests
   - Click request → Response tab for error details

4. **Database Issues**
   - PostgreSQL must be running
   - Connection string in backend/.env
   - Check backend logs for connection errors

---

## ✅ Checklist: Everything Working

- [ ] Backend running on port 3000
- [ ] Frontend running on port 8080  
- [ ] Can access http://localhost:8080
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can create asset
- [ ] Can create executor
- [ ] Can create will
- [ ] Can create switch
- [ ] Page refresh keeps data
- [ ] Server restart keeps data

**If all checked: System is working correctly!** ✅

---

**Need to reset database?**
```bash
# Set environment variable
$env:RESET_DB = "true"

# Run backend once
npm start

# Then set back to false
$env:RESET_DB = "false"

# Run backend again
npm start
```

---

**Last Updated**: April 18, 2026
**System Status**: ✅ Operational
**Data Persistence**: ✅ Fixed
