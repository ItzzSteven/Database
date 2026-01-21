const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Import bcrypt
const app = express();

app.use(express.json());
app.use(cors({ origin: 'https://ItzzSteven.is-a.dev' }));

let users = []; // Your temporary database

app.get('/', (req, res) => res.send('Server is live and encrypted!'));

// REGISTER with Encryption
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: "User exists" });
  }

  // Hash the password before saving (10 is the "salt rounds" or strength)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  users.push({ email, password: hashedPassword });
  res.json({ success: true, message: "Registered securely!" });
});

// LOGIN with Decryption
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (user) {
    // Compare the plain text password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.json({ success: true, message: "Logged in securely!" });
    }
  }
  
  res.status(401).json({ success: false, error: "Invalid credentials" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
