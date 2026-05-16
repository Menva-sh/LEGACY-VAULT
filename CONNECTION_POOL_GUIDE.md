# Connection Pool Troubleshooting Guide

## Current Configuration

### Pool Settings (Optimized for Neon)
```javascript
max: 5                          // Max concurrent connections
min: 0                          // Start with 0, grow as needed
idleTimeoutMillis: 300000       // 5 minutes idle before close
connectionTimeoutMillis: 10000  // 10s to establish connection
statement_timeout: 30000        // 30s query timeout
```

### Automatic Retry Logic
All database queries automatically retry up to 2 times on connection errors with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 100ms
- Attempt 3: After 200ms
- Fail: After 400ms+

## Monitoring Connection Health

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "database": "Connected",
  "responseTime": "200-500ms",
  "poolStats": {
    "idleCount": 0-5,
    "totalCount": 1-5,
    "waitingCount": 0
  }
}
```

### What the Metrics Mean

| Metric | Meaning | Good Range | Warning |
|--------|---------|-----------|---------|
| `idleCount` | Ready connections in pool | 0-5 | > 5 means too many idle connections |
| `totalCount` | Total connections created | 1-5 | > 10 indicates connection creep |
| `waitingCount` | Requests waiting for connection | 0 | > 0 means pool is saturated |
| `responseTime` | Query latency | < 500ms | > 1000ms indicates database slowness |

## Common Error Messages

### "Client removed from pool (idle timeout or error)"
**Status:** Normal
**Cause:** Connection was idle for 5 minutes
**Action:** None - pool will create new connections as needed

### "Client connection error: Connection terminated unexpectedly"
**Status:** Can be normal or concerning depending on frequency
**Causes:** 
- Neon server restarting (normal, temporary)
- Network interruption
- Connection idle timeout
**Action:** Monitor frequency. Occasional errors are fine. If frequent, check network and database status.

### "Query retry (attempt 2/3) after 100ms..."
**Status:** Normal
**Cause:** Connection temporarily unavailable, retrying
**Action:** None - automatic recovery in progress

### "Waiting for connection" (implied by waitingCount > 0)
**Status:** Warning
**Cause:** Pool exhausted, requests queuing up
**Action:** 
1. Check if queries are slow (see `responseTime`)
2. Monitor active connections: `curl http://localhost:3000/health`
3. Consider increasing `max` pool size (currently 5)
4. Check Neon dashboard for database status

## Troubleshooting Steps

### Step 1: Check Basic Connectivity
```bash
# Test if server is running
curl http://localhost:3000/

# Expected: {"status":"OK","message":"Backend is running",...}
```

### Step 2: Check Database Health
```bash
# Check connection pool status
curl http://localhost:3000/health

# Response should have status: "OK" and database: "Connected"
```

### Step 3: Check Neon Status
1. Visit [Neon Console](https://console.neon.tech)
2. Check your project's connection status
3. Look for any error notifications
4. Verify pooler endpoint is active

### Step 4: Test Query Execution
1. Create a test user (POST /auth/register)
2. Login (POST /auth/login)
3. Query executors (GET /executors with auth token)
4. Monitor logs for retry messages

### Step 5: Monitor Connection Pool
```bash
# Run in a loop to watch pool stats
watch -n 1 'curl -s http://localhost:3000/health | jq .poolStats'
```

## Best Practices

### 1. Use the Pooler Endpoint
✅ CORRECT: `ep-broad-mud-amd05qxd-pooler.c-5.us-east-1.aws.neon.tech`
❌ WRONG: `ep-broad-mud-amd05qxd.c-5.us-east-1.aws.neon.tech` (direct endpoint)

The pooler endpoint provides connection pooling and better concurrency handling.

### 2. Connection Timeout Settings
- `connectionTimeoutMillis: 10000` - Good for most apps
- Increase to 15000 if connecting over slow/unreliable networks
- Don't set too high (will block requests longer)

### 3. Query Timeout Settings
- `statement_timeout: 30000` - Good balance
- Increase for long-running reports/exports
- Decrease for fast APIs (prevent hanging requests)

### 4. Pool Size Settings
- `max: 5` - Conservative for Neon's limits
- Neon connection limits vary by plan (typically 15-100)
- Leave room for other connections
- Monitor `totalCount` - should stay under `max`

### 5. Error Handling
- Connection errors that trigger retries are automatically handled
- Non-connection errors (query syntax, constraint violations) fail immediately
- Logs show which errors trigger retries
- Monitor logs for patterns

## Scaling Considerations

### When totalCount approaches max
- Application is under load
- Increase `max` pool size (e.g., 5 → 10)
- Monitor Neon dashboard for actual connection count
- Check query response times

### When waitingCount > 0 consistently
- Pool is saturated
- Options:
  1. Increase `max` pool size
  2. Optimize slow queries
  3. Cache frequently-accessed data
  4. Add more database replicas

### When response time > 1 second
- Database is slow, not pool issue
- Check database indexes
- Run EXPLAIN ANALYZE on slow queries
- Check Neon dashboard for CPU/memory usage

## Environment Variables

```bash
# Required
DB_HOST=ep-...-pooler.c-5.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=***

# Optional (these can be modified for tuning)
# Connection pool configuration is in db.js - modify if needed
```

## References

- [Neon Connection Pooling](https://neon.tech/docs/guides/connection-pooling)
- [node-postgres Documentation](https://node-postgres.com/)
- [PostgreSQL Connection Parameters](https://www.postgresql.org/docs/current/runtime-config-connection.html)

## Getting Help

If connections keep dropping:
1. Check `curl http://localhost:3000/health` - confirms server is up
2. Check Neon console - is database online?
3. Review server logs - are there retry messages?
4. Check network - is there latency/packet loss?
5. Consider temporarily increasing `idleTimeoutMillis` to 600000 (10 min) for testing
