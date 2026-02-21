const pool = require("../database/");

async function logActivity(account_id, activity_type) {
  try {
    const sql = `
      INSERT INTO user_activity (account_id, activity_type)
      VALUES ($1, $2)
    `;
    await pool.query(sql, [account_id, activity_type]);
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
}

async function getActivityByAccount(account_id) {
  try {
    const sql = `
      SELECT activity_type, activity_date
      FROM user_activity
      WHERE account_id = $1
      ORDER BY activity_date DESC
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("Get Activity Error:", error);
    return [];
  }
}

module.exports = { logActivity, getActivityByAccount };