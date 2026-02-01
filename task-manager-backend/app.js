const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const JWT_SECRET = "supersecretkey";

app.use(cors({
  origin: "http://localhost:4200"
}));

app.use(bodyParser.json());

//Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
}

// Users
app.post("/users", (req, res) => {
  const { name, email, password } = req.body;

  // Required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters, include one uppercase letter, one number, and one special character"
    });
  }

  // Check duplicate email
  const sqlCheck = "SELECT id FROM users WHERE email = ?";
  db.query(sqlCheck, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Insert user
    const sqlInsert =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sqlInsert, [name, email, password], (err) => {
      if (err) {
        return res.status(500).json({ message: "Registration failed" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  });
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result[0];
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });
  });
});

//tasks
app.post("/tasks", verifyToken, (req, res) => {
  const { title, description, status, due_date } = req.body;

  const sql = `
    INSERT INTO tasks (user_id, title, description, status, due_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [req.userId, title, description, status, due_date],
    () => res.status(201).json({ message: "Task created" })
  );
});

//View tasks
app.get("/tasks", verifyToken, (req, res) => {
  const sql = "SELECT * FROM tasks WHERE user_id = ?";
  db.query(sql, [req.userId], (err, results) => {
    res.json(results);
  });
});

//Update tasks
app.put("/tasks/:id", verifyToken, (req, res) => {
  const { title, description, status, due_date } = req.body;

  const sql = `
    UPDATE tasks
    SET title=?, description=?, status=?, due_date=?
    WHERE id=? AND user_id=?
  `;

  db.query(
    sql,
    [title, description, status, due_date, req.params.id, req.userId],
    (err, result) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task updated" });
    }
  );
});

//Delete Tasks
app.delete("/tasks/:id", verifyToken, (req, res) => {
  const sql = "DELETE FROM tasks WHERE id=? AND user_id=?";
  db.query(sql, [req.params.id, req.userId], (err, result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});