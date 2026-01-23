const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

// 1. Middleware
app.use(cors()); // Allows your website to talk to this server
app.use(express.json()); // Allows server to read JSON data sent from HTML

// 2. Database Simulation (Using a JSON file)
const DB_FILE = './database.json';

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], posts: [] }));
}

function getData() { return JSON.parse(fs.readFileSync(DB_FILE)); }
function saveData(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

// --- AUTH ROUTES ---

app.post('/register', (req, res) => {
    const { email, password, username } = req.body;
    const data = getData();

    if (data.users.find(u => u.email === email)) {
        return res.json({ success: false, error: "User already exists" });
    }

    const newUser = { 
        email, 
        password, 
        username, 
        pfp: `https://ui-avatars.com{username}&background=random` 
    };
    
    data.users.push(newUser);
    saveData(data);
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const data = getData();
    const user = data.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, username: user.username, pfp: user.pfp });
    } else {
        res.json({ success: false, error: "Invalid email or password" });
    }
});

// --- FORUM ROUTES ---

app.get('/forum/posts', (req, res) => {
    const data = getData();
    // Sort by newest first
    const sortedPosts = [...data.posts].reverse();
    res.json({ posts: sortedPosts });
});

app.post('/forum/post', (req, res) => {
    const { username, pfp, title, content } = req.body;
    const data = getData();
    
    const newPost = {
        id: Date.now().toString(),
        username,
        pfp,
        title,
        content,
        created_at: new Date(),
        replies: []
    };

    data.posts.push(newPost);
    saveData(data);
    res.json({ success: true });
});

app.post('/forum/reply', (req, res) => {
    const { postId, username, pfp, message } = req.body;
    const data = getData();
    const post = data.posts.find(p => p.id === postId);

    if (post) {
        post.replies.push({ username, pfp, message, created_at: new Date() });
        saveData(data);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: "Post not found" });
    }
});

// 3. Start Server (Fixed for Render 2026)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Viper Backend Live on port ${PORT}`);
});
