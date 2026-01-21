const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Switched from Supabase to Mongoose
const app = express();

app.use(express.json());

const allowedOrigins = ['htts://www.v1p3r.pages.dev', 'https://v1p3r.pages.dev'];
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('CORS Error'))
}));

// --- DATABASE CONNECTION ---
// Connect to MongoDB using an environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB Connection Error:', err));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  pfp: String
});

const postSchema = new mongoose.Schema({
  username: String,
  title: String,
  content: String,
  pfp: String,
  replies: [{ username: String, message: String, pfp: String, timestamp: String }],
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

app.get('/', (req, res) => res.send('Viper API Live & Connected to MongoDB'));

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const pfp = `https://ui-avatars.com{username}&background=38bdf8&color=fff`;
    
    const newUser = new User({ email, username, password: hashedPassword, pfp });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: "User or Email already exists" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    return res.json({ success: true, username: user.username, pfp: user.pfp });
  }
  res.status(401).json({ success: false, error: "Invalid login" });
});

// --- FORUM ROUTES ---
app.get('/forum/posts', async (req, res) => {
  const posts = await Post.find().sort({ created_at: -1 });
  res.json({ success: true, posts });
});

app.post('/forum/post', async (req, res) => {
  try {
    const { username, title, content, pfp } = req.body;
    const newPost = new Post({ username, title, content, pfp });
    await newPost.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

app.post('/forum/reply', async (req, res) => {
  try {
    const { postId, username, message, pfp } = req.body;
    const reply = { username, message, pfp, timestamp: new Date().toLocaleString() };
    
    await Post.findByIdAndUpdate(postId, { $push: { replies: reply } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
