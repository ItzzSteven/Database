const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json());
app.use(cors({ origin: 'https://ItzzSteven.is-a.dev' }));
app.options('*', cors());

// --- PERMANENT DATABASE CONNECTION ---
// This reads from the Environment Variables you just added in Render
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Saves user to Supabase forever
  const { error } = await supabase.from('users').insert([
    { email, username, password: hashedPassword, pfp: `https://ui-avatars.com{username}&background=38bdf8&color=fff` }
  ]);

  if (error) return res.status(400).json({ success: false, error: "Username or Email taken" });
  res.json({ success: true, message: "Account created!" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();

  if (user && await bcrypt.compare(password, user.password)) {
    return res.json({ success: true, username: user.username, pfp: user.pfp });
  }
  res.status(401).json({ success: false, error: "Invalid login" });
});

// --- FORUM ROUTES ---
app.get('/forum/posts', async (req, res) => {
  // Loads posts from Supabase
  const { data } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
  res.json({ success: true, posts: data || [] });
});

app.post('/forum/post', async (req, res) => {
  const { username, title, content, pfp } = req.body;
  const { error } = await supabase.from('forum_posts').insert([{ username, title, content, pfp }]);
  res.json({ success: !error });
});

app.post('/forum/reply', async (req, res) => {
  const { postId, username, message } = req.body;
  const { data: post } = await supabase.from('forum_posts').select('replies').eq('id', postId).single();
  
  const updatedReplies = [...(post.replies || []), { username, message, timestamp: new Date().toLocaleString() }];
  
  const { error } = await supabase.from('forum_posts').update({ replies: updatedReplies }).eq('id', postId);
  res.json({ success: !error });
});

app.listen(process.env.PORT || 10000);
