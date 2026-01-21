const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

// This tells the server to allow requests from your specific website
app.use(cors({ 
  origin: 'https://ItzzSteven.is-a.dev' 
}));

// A simple test route to make sure it's working
app.get('/', (req, res) => {
  res.send('Server is running and ready for logins!');
});

// This is where your login logic will go later
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);
  
  // Right now, it just says 'Success' for any login to test the connection
  res.json({ success: true, message: "Connected to Render!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
