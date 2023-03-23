const {
  chars,
  getUserByEmail,
  getUserById,
  urlsForUser,
  generateRandomString,
  ErrorMessage,
} = require('./helpers');
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

// Database
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userId: 'userRandomID',
    created: 0,
    visted: 0,
    uniqueVisits: [],
  },

  '9sm5xK': {
    longURL: 'http://www.google.com',
    userId: 'user2RandomID',
    created: 0,
    visted: 0,
    uniqueVisits: [],
  },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

// Middleware
app.use(
  cookieSession({
    name: 'user_id',
    keys: ['123'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

// @route /urls
// @desc Renders and allow users to see shortened URLS
// @method GET

app.get('/', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (!user) {
    res.redirect('/login');
  }

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first before viewing your URLs.',
      '/login'
    ).renderError(res, user);
  }

  const urls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = {
    urls: urls,
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = getUserById(req.session.user_id, users);
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];

  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist'
    ).renderError(res, user);
  }

  if (!req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to view this URL'
    ).renderError(res, user);
  }

  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to view this URL'
    ).renderError(res, user);
  }

  // If all checks passes
  const templateVars = {
    longURL: urlDatabase[req.params.id].longURL,
    created: urlDatabase[req.params.id].created,
    visited: urlDatabase[req.params.id].visited,
    id: req.params.id,
    user: users[req.session.user_id],
  };

  res.render('urls_show', templateVars);
});

// @route /urls, /urls/:id
// @desc Updates shortened URLS
// @method POST

app.post('/urls', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      "You're not authorized to add new pages. Please login again."
    ).renderError(res, user);
  }

  const id = generateRandomString(chars, 6);

  urlDatabase[id] = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
    created: new Date(),
    visited: 0,
  };

  res.redirect('/urls/' + id);
});

app.post('/urls/:id/delete', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist'
    ).renderError(res, user);
  }

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to edit this URL'
    ).renderError(res, user);
  }

  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to edit this URL'
    ).renderError(res, user);
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist'
    ).renderError(res, user);
  }

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to edit this URL'
    ).renderError(res, user);
  }

  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to edit this URL'
    ).renderError(res, user);
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// @route /u/:id
// @desc Redirects user to website through shortened URL
// @method GET

app.get('/u/:id', (req, res) => {
  const user = users[req.session.user_id];
  const url = urlDatabase[req.params.id];

  if (!url) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist. please try another URL'
    ).renderError(res, user);
  }

  urlDatabase[req.params.id].visited += 1;
  res.redirect(longURL, user);
});

// @routes /register, /login
// @desc Renders pages for authentication
// @method GET

app.get('/register', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (user) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (user) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  res.render('urls_login', templateVars);
});

// @route /register, /login, /logout
// @desc Allow users to authenticate through requests made on page
// @method GET

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return new ErrorMessage(
      'User not found',
      'Could not find user with provided email.'
    ).renderError(res, user);
  }

  const comparePassword = bcrypt.compareSync(password, user.password);

  if (!comparePassword) {
    return new ErrorMessage(
      'Incorrect credentials',
      'Password is incorrect, please try again.'
    ).renderError(res, user);
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const userId = generateRandomString(chars, 6);
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (user) {
    return new ErrorMessage(
      'User is exists',
      'User with the provided email already exists.'
    ).renderError(res, user);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    email,
    password: hashedPassword,
    id: userId,
  };

  req.session.user_id = userId;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.post('/clear', (req, res) => {
  res.clearSession('user_id');
  res.send("<span>Cleared<a href='/urls'>Go back</a></span>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
