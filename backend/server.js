const express = require('express');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://kartikthakur7107.github.io', // or "*" to allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

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

// Login (insecure, plain text comparison)
app.post('/login', async (req, res) => {
  const { UserID, Password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE "UserID" = $1 AND "Password" = $2',
      [UserID, Password]
    );

    if (result.rows.length > 0) {
      res.json({ message: 'Login successful', UserID: result.rows[0].UserID });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register a user (insecure, no hashing)
app.post('/register', async (req, res) => {
  console.log(req.body);
  const { UserID, Password, Email, FullName, PNum, Address } = req.body;

  try {
    await pool.query(
      'INSERT INTO "user" ("UserID", "Password", "Email", "FullName", "PNum", "Address") VALUES ($1, $2, $3, $4, $5, $6)',
      [UserID, Password, Email, FullName, PNum, Address]
    );
    res.send('User registered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
});

// Book an service request
app.post('/book', async (req, res) => {
  console.log(req.body);
  const { RequestID, carmodel, caryear, carcompany, Descrption, MechanicID, CustomerID } = req.body;

  try {
    await pool.query(
      'INSERT INTO servicerequest ("RequestID", "carmodel", "caryear", "carcompany", "Descrption", "MechanicID", "CustomerID") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [RequestID, carmodel, caryear, carcompany, Descrption, MechanicID,  CustomerID]
    );
    res.send('Service Request confirmed');
  } catch (err) {
    console.error(err);
    res.status(500).send('Booking failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
