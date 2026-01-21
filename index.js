const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

// Multi-Origin CORS for iPad/Desktop/is-a.dev
const allowedOrigins = ['https://ItzzSteven.is-a.dev', 'https://itzzsteven.is-a.dev'];
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('CORS Error'))
}));
app.options('*', cors());

let users = []; 
let forumPosts = [];

// AUTH ROUTES
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ success: false, error: "User/Email exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, username, password: hashedPassword });
  res.json({ success: true, message: "Account created!" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (user && await bcrypt.compare(password, user.password)) {
    return res.json({ success: true, username: user.username });
  }
  res.status(401).json({ success: false, error: "Invalid login" });
});

// FORUM ROUTES
app.get('/forum/posts', (req, res) => res.json({ success: true, posts: forumPosts }));

app.post('/forum/post', (req, res) => {
  const { username, message } = req.body;
  const post = {
    id: "p" + Date.now(),
    username, message,
    pfp: `https://ui-avatars.com{username}`,
    timestamp: new Date().toLocaleString(),
    replies: []
  };
  forumPosts.unshift(post);
  res.json({ success: true });
});

app.post('/forum/reply', (req, res) => {
  const { postId, username, message } = req.body;
  const post = forumPosts.find(p => p.id === postId);
  if (post) {
    post.replies.push({ username, message, timestamp: new Date().toLocaleString() });
    res.json({ success: true });
  } else { res.status(404).json({ error: "Not found" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
