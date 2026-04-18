# Dead Man's Switch - Implementation Summary

## What Was Implemented

### ✅ Database Changes
1. **Migration 008**: Added `last_active` timestamp to users table
   - Tracks when user last logged in
   - Auto-indexed for performance
   
2. **Migration 009**: Added `status` column to dead_mans_switch table
   - Values: 'pending', 'triggered', 'resolved', 'cancelled'
   - Used to track switch state across executions

### ✅ Scheduler Service
**File**: `backend/services/deadManswitchScheduler.js`

**Key Methods**:
- `start()` - Initializes cron job at 2:00 AM daily
- `checkInactiveUsers()` - Main business logic that queries and processes switches
- `triggerSwitch()` - Activates executors when user inactive
- `resolveSwitch()` - Resets switch when user returns active
- `runManually()` - For testing purposes

**Cron Schedule**: `0 2 * * *`
- Seconds: 0
- Minutes: 2
- Hours: * (every)
- Day of Month: * (every)
- Month: * (every)
- Day of Week: * (every)
- **Result**: 2:00 AM UTC every day

### ✅ Authentication Update
**File**: `backend/controllers/authController.js`

**Change**: Login endpoint now updates `users.last_active = NOW()`
- Executed immediately after password verification
- Provides accurate activity tracking

### ✅ Server Initialization
**File**: `backend/server.js`

**Changes**:
1. Import deadManswitchScheduler
2. Call `deadManswitchScheduler.start()` before `app.listen()`
3. Added `/test/dead-mans-switch-check` endpoint for manual testing

### ✅ Dependencies
**File**: `backend/package.json`

**Added**: `node-cron: ^3.0.3`
- Provides cron scheduling capability
- Runs background jobs without external processes

## How The System Works

### Daily Execution (2:00 AM)
```
Scheduler triggers
    ↓
Query all active switches with user activity data
    ↓
For each switch:
    ├─ Calculate days_inactive = NOW() - last_active
    ├─ If days_inactive >= trigger_value:
    │  ├─ Set status = 'triggered'
    │  ├─ Grant executor access (is_active = true)
    │  └─ Record triggered_at timestamp
    └─ If days_inactive < trigger_value AND status = 'triggered':
       ├─ Set status = 'pending'
       └─ User is still executor (access not revoked)
    ↓
Log results
    ↓
Wait until next day 2:00 AM
```

### User Activity Flow
```
User Login
    ↓
Password verified
    ↓
UPDATE users SET last_active = NOW()
    ↓
JWT token generated
    ↓
User can use system
```

## Example Data Flow

### Initial Setup
```sql
-- User created
INSERT INTO users (..., last_active = NOW());

-- Executor designated
INSERT INTO executors (..., is_active = false, status = 'pending');

-- Dead man's switch created
INSERT INTO dead_mans_switch (trigger_value = 30, status = 'pending');
```

### After 35 Days of Inactivity
```
Daily scheduler runs (2:00 AM)
  ├─ days_inactive = 35
  ├─ trigger_value = 30
  ├─ 35 >= 30? YES → TRIGGER
  │
  ├─ UPDATE dead_mans_switch SET status = 'triggered'
  ├─ UPDATE executors SET is_active = true, status = 'approved'
  │
  └─ Log: "TRIGGERED for user@example.com (35 days inactive)"
      Log: "Granted access to X executors"

Now executors can:
  ✓ View user's digital assets
  ✓ Access digital wills
  ✓ Manage executor duties
```

### If User Returns Active
```
User logs in
  ├─ Password verified
  ├─ UPDATE users SET last_active = NOW()
  └─ User regains control

Next daily scheduler run:
  ├─ days_inactive = 2
  ├─ trigger_value = 30
  ├─ 2 >= 30? NO
  ├─ status = 'triggered'? YES → RESOLVE
  │
  ├─ UPDATE dead_mans_switch SET status = 'pending'
  └─ Log: "RESOLVED for user@example.com - user is active again"

Note: Executors keep access (not revoked)
```

## Testing Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Restart Backend
```bash
npm start
```
You should see:
```
=== INITIALIZING SCHEDULED JOBS ===
[Dead Mans Switch] Starting scheduler...
[Dead Mans Switch] Scheduler started - runs daily at 2:00 AM
=== SCHEDULED JOBS INITIALIZED ===
```

### 3. Manual Test Endpoint
```bash
curl -X POST http://localhost:3000/test/dead-mans-switch-check
```

Expected response:
```json
{
  "message": "Dead Man's Switch check completed",
  "timestamp": "2026-04-18T..."
}
```

Check backend logs for:
```
[Dead Mans Switch] Running daily inactive user check at ...
[Dead Mans Switch] Found X active switches to check
[Dead Mans Switch] Checking user email@example.com: X days inactive (trigger: Y days)
```

### 4. Database Verification

Check user last_active:
```sql
SELECT id, email, last_active FROM users WHERE id = 1;
```

Check switch status:
```sql
SELECT id, user_id, status, trigger_value, triggered_at 
FROM dead_mans_switch 
WHERE user_id = 1;
```

Check executor access:
```sql
SELECT id, executor_name, is_active, status 
FROM executors 
WHERE user_id = 1;
```

## File Structure
```
LEGACY VAULT/
├── backend/
│   ├── services/
│   │   └── deadManswitchScheduler.js         (New)
│   ├── migrations/
│   │   ├── 008_add_last_active_to_users.sql  (New)
│   │   └── 009_add_status_to_dead_mans_switch.sql (New)
│   ├── controllers/
│   │   └── authController.js                 (Updated)
│   ├── server.js                             (Updated)
│   └── package.json                          (Updated - added node-cron)
│
└── DEAD_MANS_SWITCH_README.md               (New - detailed docs)
```

## Key Design Decisions

1. **Scheduled Job, Not Event-Driven**
   - Simpler implementation
   - No real-time dependency
   - Less database load
   - 24-hour verification window is acceptable

2. **Daily Execution at 2:00 AM**
   - Off-peak time
   - Consistent across timezones
   - Avoids user interaction interference

3. **Status-Based Tracking**
   - Enables resolution/re-activation
   - Audit trail of triggers
   - Executor access is permanent (not revoked)

4. **Inactivity = No Login**
   - Simple to understand
   - Easy to implement
   - Portable across systems

## Next Steps

1. User can create dead man's switches via API
2. Executors notified when access granted (email notification)
3. Add UI for managing switches (enable/disable/configure)
4. Historical analytics on switch triggers

## Environment Variables Needed
```
TZ=UTC                    # For consistent scheduling
CORS_ORIGIN=...          # Existing
DB_*=...                 # Existing
JWT_SECRET=...           # Existing
```

## Dependencies
- node-cron: ^3.0.3 (new)
- All other dependencies unchanged
