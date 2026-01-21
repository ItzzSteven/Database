const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

// 1. MIDDLEWARE
app.use(express.json());

// 2. STRICTOR CORS FOR IPAD/MOBILE
const allowedOrigins = [
  'https://ItzzSteven.is-a.dev', 
  'https://itzzsteven.is-a.dev',
  'https://www.ItzzSteven.is-a.dev',
  'https://www.itzzsteven.is-a.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps) or if in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// IMPORTANT: This handles the "Preflight" test iPads send before logging in
app.options('*', cors());

// 3. DATABASE (Temporary list - resets when server sleeps)
let users = []; 

// 4. ROUTES
app.get('/', (req, res) => {
  res.send('Server is live, encrypted, and allowing all versions of is-a.dev!');
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
    res.status(500).json({ success: false, error: "Server Error" });
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
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// 5. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
