const cron = require('node-cron');
const pool = require('../db');

/**
 * DEAD MAN'S SWITCH SCHEDULER
 * 
 * Runs daily at 2:00 AM to check for inactive users
 * If a user hasn't been active within their switch's trigger_value (days),
 * the switch is triggered and executor access is granted
 * 
 * SCHEDULING LOGIC:
 * - Cron expression: '0 2 * * *' runs every day at 2:00 AM
 * - Queries all active dead man's switches
 * - Checks users.last_active vs current time
 * - If (now - last_active) > trigger_value days:
 *   * Update switch status to 'triggered'
 *   * Grant executor access by updating is_active = true
 *   * Record triggered_at timestamp
 * - If user becomes active again:
 *   * Update switch status back to 'pending'
 */

class DeadManswitchScheduler {
  constructor() {
    this.job = null;
  }

  /**
   * Start the Dead Man's Switch daily checker
   * Runs every day at 2:00 AM
   */
  start() {
    console.log('[Dead Mans Switch] Starting scheduler...');
    
    // Cron pattern: '0 2 * * *' = 2:00 AM every day
    // Format: second minute hour day month dayOfWeek
    this.job = cron.schedule('0 2 * * *', async () => {
      console.log('[Dead Mans Switch] Running daily inactive user check at', new Date().toISOString());
      await this.checkInactiveUsers();
    });

    console.log('[Dead Mans Switch] Scheduler started - runs daily at 2:00 AM');
  }

  /**
   * Check all active switches for inactive users
   * This is the core business logic
   */
  async checkInactiveUsers() {
    try {
      // Get all active switches with their users
      const query = `
        SELECT 
          dms.id,
          dms.user_id,
          dms.trigger_value,
          dms.trigger_type,
          dms.status,
          u.email,
          u.first_name,
          u.last_active,
          EXTRACT(DAY FROM NOW() - u.last_active) as days_inactive
        FROM dead_mans_switch dms
        JOIN users u ON dms.user_id = u.id
        WHERE dms.is_active = true
        AND dms.status IN ('pending', 'triggered')
        ORDER BY u.id, dms.id
      `;

      const result = await pool.query(query);
      console.log(`[Dead Mans Switch] Found ${result.rows.length} active switches to check`);

      for (const switchRecord of result.rows) {
        const { 
          id, 
          user_id, 
          trigger_value, 
          trigger_type, 
          status,
          email,
          first_name,
          last_active,
          days_inactive 
        } = switchRecord;

        console.log(`[Dead Mans Switch] Checking user ${email}: ${days_inactive} days inactive (trigger: ${trigger_value} days)`);

        // Determine if switch should be triggered
        const shouldTrigger = days_inactive >= trigger_value;

        if (shouldTrigger && status === 'pending') {
          // User is inactive - TRIGGER THE SWITCH
          await this.triggerSwitch(id, user_id, email, first_name, days_inactive);
        } else if (!shouldTrigger && status === 'triggered') {
          // User became active again - RESOLVE THE SWITCH
          await this.resolveSwitch(id, user_id, email);
        }
      }

      console.log('[Dead Mans Switch] Check completed successfully');
    } catch (error) {
      console.error('[Dead Mans Switch] Error checking inactive users:', error.message);
    }
  }

  /**
   * Trigger the switch: grant executor access
   */
  async triggerSwitch(switchId, userId, email, firstName, daysInactive) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update switch status to 'triggered'
      await client.query(
        `UPDATE dead_mans_switch 
         SET status = $1, triggered_at = NOW(), last_check = NOW() 
         WHERE id = $2`,
        ['triggered', switchId]
      );

      // 2. Get all executors for this user and grant them access
      const executorsResult = await client.query(
        `SELECT id FROM executors 
         WHERE user_id = $1 
         AND is_active = false`,
        [userId]
      );

      // 3. Activate all executors (grant access)
      for (const executor of executorsResult.rows) {
        await client.query(
          `UPDATE executors 
           SET is_active = true, status = $1 
           WHERE id = $2`,
          ['approved', executor.id]
        );
      }

      await client.query('COMMIT');

      console.log(`[Dead Mans Switch] TRIGGERED for ${email} (${daysInactive} days inactive)`);
      console.log(`[Dead Mans Switch] Granted access to ${executorsResult.rows.length} executors`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[Dead Mans Switch] Error triggering switch for user ${userId}:`, error.message);
    } finally {
      client.release();
    }
  }

  /**
   * Resolve the switch: user became active again
   */
  async resolveSwitch(switchId, userId, email) {
    try {
      await pool.query(
        `UPDATE dead_mans_switch 
         SET status = $1, last_check = NOW() 
         WHERE id = $2`,
        ['pending', switchId]
      );

      console.log(`[Dead Mans Switch] RESOLVED for ${email} - user is active again`);
    } catch (error) {
      console.error(`[Dead Mans Switch] Error resolving switch for user ${userId}:`, error.message);
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('[Dead Mans Switch] Scheduler stopped');
    }
  }

  /**
   * For testing: run check immediately
   */
  async runManually() {
    console.log('[Dead Mans Switch] Running manual check...');
    await this.checkInactiveUsers();
  }
}

module.exports = new DeadManswitchScheduler();
