# Dead Man's Switch Implementation

## Overview
The Dead Man's Switch is an automated system that monitors user activity and automatically grants executor access when a user becomes inactive for a specified period.

## How It Works

### 1. **Activity Tracking**
- `users.last_active` is updated every time a user logs in
- This timestamp marks the most recent user activity
- Default: Set to `CURRENT_TIMESTAMP` on user creation

### 2. **Daily Scheduler Job**
- **Cron Schedule**: `0 2 * * *` (runs daily at 2:00 AM)
- **Location**: `backend/services/deadManswitchScheduler.js`
- **Trigger**: Executes automatically on the backend

### 3. **Inactivity Detection Logic**
```
For each active dead_mans_switch:
  days_inactive = NOW() - users.last_active
  
  IF days_inactive >= switch.trigger_value THEN
    // User is inactive - TRIGGER SWITCH
    UPDATE dead_mans_switch SET status = 'triggered'
    UPDATE executors SET is_active = true (grant access)
    
  ELSE IF switch.status == 'triggered' AND days_inactive < trigger_value THEN
    // User became active again - RESOLVE SWITCH
    UPDATE dead_mans_switch SET status = 'pending'
```

## Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```
- Tracks when user last logged in
- Used to calculate inactivity duration

### Dead Man's Switch Table
```sql
ALTER TABLE dead_mans_switch ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
```
- **trigger_type**: 'inactivity_days'
- **trigger_value**: Number of days of inactivity (e.g., 30)
- **status**: 
  - `pending` - Waiting for inactivity threshold
  - `triggered` - User is inactive, executors have access
  - `resolved` - User became active again
  - `cancelled` - Manually disabled

### Executors Table
- **is_active**: Set to `true` when switch triggers
- **status**: Changed to `'approved'` when access granted

## API Endpoints

### Login (Updated)
**POST** `/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response includes JWT token
- **Side effect**: Updates `users.last_active = NOW()`

### Manual Switch Check (Testing)
**POST** `/test/dead-mans-switch-check`
- Manually triggers the inactivity check
- Useful for testing without waiting 24 hours
- Returns results of check

## Scheduling Logic Explanation

### Cron Expression: `0 2 * * *`
```
┌────────────── second (0 - 59)
│ ┌──────────── minute (0 - 59)
│ │ ┌────────── hour (0 - 23)
│ │ │ ┌──────── day of month (1 - 31)
│ │ │ │ ┌────── month (1 - 12)
│ │ │ │ │ ┌──── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │ │
0 2 * * *

- 0 seconds
- 2 (2:00 AM in 24-hour format)
- * (every day of month)
- * (every month)
- * (every day of week)
```

**Result**: Runs at 2:00 AM UTC every single day

### Query Flow
```
1. Get all active switches with user data:
   SELECT dms.*, u.last_active, EXTRACT(DAY FROM NOW() - u.last_active) as days_inactive

2. For each switch:
   - Calculate days since last login
   - Compare to trigger_value
   - Execute trigger/resolve logic if needed

3. Log results and completion status
```

## Example Scenario

### Setup
- User: john@example.com
- Last Active: 2026-04-10 14:30
- Dead Man's Switch: trigger_value = 30 days, status = 'pending'
- Executor: jane@example.com (is_active = false)

### Execution (Daily at 2:00 AM)
```
Current Date: 2026-05-15

days_inactive = 35 days (since April 10)
trigger_value = 30 days

35 >= 30? YES → TRIGGER

Actions:
1. UPDATE dead_mans_switch SET status = 'triggered', triggered_at = NOW()
2. UPDATE executors SET is_active = true, status = 'approved' WHERE user_id = john
3. Jane now has access to John's digital assets

Log:
[Dead Mans Switch] TRIGGERED for john@example.com (35 days inactive)
[Dead Mans Switch] Granted access to 1 executor
```

### If User Logs In
```
Date: 2026-05-20

User logs in → UPDATE users SET last_active = NOW()

Next scheduler run (2:00 AM):

days_inactive = 5 days
trigger_value = 30 days

5 >= 30? NO AND status = 'triggered'? YES → RESOLVE

Actions:
1. UPDATE dead_mans_switch SET status = 'pending'
2. Executors retain access (not revoked)

Log:
[Dead Mans Switch] RESOLVED for john@example.com - user is active again
```

## Backend Configuration

### File Structure
```
backend/
├── services/
│   └── deadManswitchScheduler.js     (Main scheduler logic)
├── migrations/
│   ├── 008_add_last_active_to_users.sql
│   └── 009_add_status_to_dead_mans_switch.sql
├── controllers/
│   └── authController.js              (Updated login with last_active)
├── server.js                          (Scheduler initialization)
└── package.json                       (Added node-cron)
```

### Initialization Flow
```
Server Start
  ↓
Load All Routes
  ↓
Initialize Database (Migrations)
  ↓
Start Dead Man's Switch Scheduler
  ↓
Listen on Port 3000
  ↓
Scheduler waits until 2:00 AM
  ↓
Daily execution begins
```

## Testing the Feature

### Test 1: Manual Trigger
```bash
curl -X POST http://localhost:3000/test/dead-mans-switch-check
```

### Test 2: Create Test Scenario
1. Register a user (sets last_active = NOW)
2. Create a dead man's switch with trigger_value = 1 day
3. Directly update user in database:
   ```sql
   UPDATE users SET last_active = NOW() - INTERVAL '2 days' WHERE id = ?
   ```
4. Run manual check
5. Verify executors were activated

### Expected Behavior
- User logs in → last_active updates
- 24 hours later → Scheduler runs check
- If last_active is older than trigger_value → Switch triggers
- Executors get is_active = true and status = 'approved'
- If user logs in again → Status returns to 'pending'

## Error Handling
- Database connection errors → Logged, continues on next run
- Transaction rollback on executor activation failure
- Graceful handling of missing executors
- Detailed logging for debugging

## Important Notes

1. **Timezone**: Scheduler uses server timezone. Set `TZ` environment variable if needed.
2. **Executor Access**: Once granted, access is NOT revoked when user returns active (permanent delegation)
3. **Multiple Switches**: Each user can have multiple switches with different trigger values
4. **Production**: Consider increasing trigger_value (e.g., 90 days) for production deployments

## Dependencies
- `node-cron`: ^3.0.3 - For scheduling the daily job
- Other existing dependencies used for database queries and logging
