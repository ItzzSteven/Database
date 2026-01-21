const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

// 1. MIDDLEWARE CONFIGURATION
app.use(express.json());

// 2. STRENGTHENED CORS SETTINGS
// Ensure NO trailing slash at the end of the URL
const allowedOrigin = 'https://itzzsteven.is-a.dev';

app.use(cors({ 
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle "Preflight" requests (Required by modern browsers for POST requests)
app.options('*', cors());

// 3. DATABASE (Temporary in-memory list)
let users = []; 

// 4. ROUTES
app.get('/', (req, res) => {
  res.send('Server is live, encrypted, and allowing is-a.dev!');
});

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    res.json({ success: true, message: "Registered securely!" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Registration failed on server" });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      return res.json({ success: true, message: "Logged in securely!" });
    }
    res.status(401).json({ success: false, error: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Login failed on server" });
  }
});

// 5. SERVER START
// Render automatically assigns a PORT; fallback to 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
