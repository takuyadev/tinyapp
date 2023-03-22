const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// Constants
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
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

const chars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');

// Generates random number based on range
const getRandomNumber = (range) => Math.floor(Math.random() * range);

// Generates random string, dependent on getRandomNumber
const generateRandomString = (arr, length) => {
  return new Array(length).fill(0).reduce((acc) => {
    const randomIndex = getRandomNumber(arr.length);
    return (acc += arr[randomIndex]);
  }, '');
};

const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return user[id];
    }
  }
  return null;
};

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// @route /urls
// @desc Allow users to shorten their long URLs into shortened links

app.get('/', (req, res) => {
  res.send("<html>Go to <a href='urls'>/urls</a></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const randomString = generateRandomString(chars, 6);
  urlDatabase[randomString] = req.body.longURL;
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.send('Deleted');
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.send('Edit');
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_register', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.email, { httpOnly: true });
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const userId = generateRandomString(chars, 6);
  const { email, password } = req.body;

  const user = getUserByEmail(email);

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

  users[userId] = {
    email,
    password,
    id: userId,
  };

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
