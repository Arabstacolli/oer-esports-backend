const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// Create database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ------------------ ROUTES ------------------

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Username and password cannot be blank" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password.trim(), user.password);
      if (match) {
        res.json({ success: true, user });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Username and password cannot be blank" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username.trim(),
      hashedPassword,
    ]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ success: false, message: "Username already exists" });
    } else {
      console.error(err);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
});

// ------------------ START SERVER ------------------
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
