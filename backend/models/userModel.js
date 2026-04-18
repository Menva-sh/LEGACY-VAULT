const pool = require('../db');

// Create a new user
const createUser = async (email, hashedPassword, firstName, lastName) => {
  try {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, first_name, last_name, created_at
    `;
    const result = await pool.query(query, [email, hashedPassword, firstName, lastName]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error creating user: ${err.message}`);
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  try {
    const query = 'SELECT id, email, password_hash, first_name, last_name, created_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching user: ${err.message}`);
  }
};

// Get user by id
const getUserById = async (id) => {
  try {
    const query = 'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching user: ${err.message}`);
  }
};

// Update user profile
const updateUserProfile = async (id, firstName, lastName) => {
  try {
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, first_name, last_name
    `;
    const result = await pool.query(query, [firstName, lastName, id]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating user: ${err.message}`);
  }
};

// Check if user exists
const userExists = async (email) => {
  try {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  } catch (err) {
    throw new Error(`Error checking user: ${err.message}`);
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
  userExists
};
