// models/account-model.js
const pool = require("../database") // your database connection

async function registerAccount(firstname, lastname, email, password) {
  const sql = `
    INSERT INTO account
    (account_firstname, account_lastname, account_email, account_password, account_type)
    VALUES ($1, $2, $3, $4, 'Client')
    RETURNING *
  `
  const result = await pool.query(sql, [firstname, lastname, email, password])
  return result.rows[0]
}

async function getAccountByEmail(email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM account
    WHERE account_email = $1
  `
  const result = await pool.query(sql, [email])
  return result.rows[0]
}

async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM account
    WHERE account_id = $1
  `
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

async function updateAccountById(id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1, account_lastname = $2, account_email = $3
    WHERE account_id = $4
  `
  const result = await pool.query(sql, [firstname, lastname, email, id])
  return result.rowCount
}

async function updatePasswordById(id, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
  `
  const result = await pool.query(sql, [hashedPassword, id])
  return result.rowCount
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccountById,
  updatePasswordById
}