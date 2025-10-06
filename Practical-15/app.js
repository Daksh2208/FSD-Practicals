const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: 'your_secret_key',      // change this to a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // Session lasts 30 minutes
}));

// GET login page
app.get('/', (req, res) => {
  res.render('login', { error: null });
});

// POST login form submission
app.post('/login', (req, res) => {
  const username = req.body.username?.trim();

  if (!username) {
    return res.render('login', { error: 'Please enter your name.' });
  }

  // Save username and login time in session
  req.session.user = {
    name: username,
    loginTime: new Date()
  };

  res.redirect('/profile');
});

// Middleware to protect profile route
function authMiddleware(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

// GET profile page
app.get('/profile', authMiddleware, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// GET logout route - destroys session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
