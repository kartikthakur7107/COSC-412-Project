const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Check DB connection
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

// Register a user (insecure, no hashing)
app.post('/register', async (req, res) => {
  const { UserID, Password } = req.body;

  try {
    await pool.query(
      'INSERT INTO "user" ("UserID", "Password") VALUES ($1, $2)',
      [UserID, Password]
    );
    res.send('User registered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
});

// Login (insecure, plain text comparison)
app.post('/login', async (req, res) => {
  const { UserID, Password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE "UserID" = $1 AND "Password" = $2',
      [UserID, Password]
    );

    if (result.rows.length > 0) {
      res.send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

