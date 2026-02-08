const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity. Fire-and-forget — never throws.
 */
const log = async (userId, action, { entity, entityId, meta, ip } = {}) => {
  try {
    await ActivityLog.create({ userId, action, entity, entityId, meta, ip });
  } catch (err) {
    console.error('[ActivityLog]', err.message);
  }
};

module.exports = { log };
