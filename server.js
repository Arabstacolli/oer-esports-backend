const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create database connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "kobe9999",   // use the same root password you type in Workbench
  database: "oer_esports",
  port: 3306                        // change if your MySQL is running on another port
});


// ------------------ ROUTES ------------------

// Login route
// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Username and password cannot be blank" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username.trim(), password.trim()]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
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
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username.trim(),
      password.trim(),
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
