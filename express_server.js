const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs')

// Random character index
const chars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');

// Database
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userId: 'userRandomID',
  },

  '9sm5xK': {
    longURL: 'http://www.google.com',
    userId: 'user2RandomID',
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

// Handles error for both terminal and front-end
class ErrorMessage {
  constructor(error, message, redirect) {
    this.error = error;
    this.message = message;
    this.redirect = redirect || '/urls';
  }

  sendError(res) {
    res.send(
      `${this.error}: ${this.message}\n <a href="${this.redirect}">Redirect to ${this.redirect}</a>`
    );
  }

  renderError(res, data) {
    res.status(404).render('urls_error', {
      error: this.error,
      message: this.message,
      ...data,
    });
  }
}

// Generates random number based on range
const getRandomNumber = (range) => Math.floor(Math.random() * range);

// Generates random string, dependent on getRandomNumber
const generateRandomString = (arr, length) => {
  return new Array(length).fill(0).reduce((acc) => {
    const randomIndex = getRandomNumber(arr.length);
    return (acc += arr[randomIndex]);
  }, '');
};

const getUserById = (userId) => {
  for (const id in users) {
    if (users[id].id === userId) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = (userId) => {
  let result = {};

  for (const urlId in urlDatabase) {
    if (userId === urlDatabase[urlId].userId) {
      result[urlId] = urlDatabase[urlId];
    }
  }

  return result;
};

const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

// @route /urls
// @desc Renders and allow users to see shortened URLS
// @method GET

app.get('/', (req, res) => {
  res.send("<html>Go to <a href='urls'>/urls</a></html>\n");
});

app.get('/urls', (req, res) => {
  const user = getUserById(req.cookies['user_id']);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      "Please login first before viewing your URLs.",
      "/login"
    ).sendError(res);
  }

  const urls = urlsForUser(req.cookies['user_id']);

  const templateVars = {
    urls: urls,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage('Invalid URL', 'This URL does not exist').sendError(
      res
    );
  }

  if (!req.cookies['user_id']) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to view this URL'
    ).sendError(res);
  }

  if (urlDatabase[req.params.id].userId !== req.cookies['user_id']) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to view this URL'
    ).sendError(res);
  }

  // If all checks passes
  const templateVars = {
    longURL: urlDatabase[req.params.id].longURL,
    id: req.params.id,
    user: users[req.cookies['user_id']],
  };

  res.render('urls_show', templateVars);
});

// @route /urls, /urls/:id
// @desc Updates shortened URLS
// @method POST

app.post('/urls', (req, res) => {
  const user = getUserById(req.cookies['user_id']);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      "You're not authorized to add new pages. Please login again."
    ).sendError(res);
  }

  const id = generateRandomString(chars, 6);

  urlDatabase[id] = {
    longURL: req.body.longURL,
    userId: req.cookies['user_id'],
  };

  res.send('URL created. <a href="/urls">Go back</a>'); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:id/delete', (req, res) => {
  const user = getUserById(req.cookies['user_id']);

  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage('Invalid URL', 'This URL does not exist').sendError(
      res
    );
  }

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to view this URL'
    ).sendError(res);
  }

  if (urlDatabase[req.params.id].userId !== req.cookies['user_id']) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to delete this URL'
    ).sendError(res);
  }

  delete urlDatabase[req.params.id];
  res.send('Deleted. <a href="/urls">Go back</a>');
});

app.post('/urls/:id', (req, res) => {
  const user = getUserById(req.cookies['user_id']);

  if (!urlDatabase[req.params.id]) {
    return new ErrorMessage('Invalid URL', 'This URL does not exist').sendError(
      res
    );
  }

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first to edit this URL'
    ).sendError(res);
  }

  if (urlDatabase[req.params.id].userId !== req.cookies['user_id']) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to edit this URL'
    ).sendError(res);
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.send('Editted. <a href="/urls">Go back</a>');
});

// @route /u/:id
// @desc Redirects user to website through shortened URL
// @method GET

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist. please try another URL'
    ).sendError(res);
  }

  res.redirect(longURL);
});

// @routes /register, /login
// @desc Renders pages for authentication
// @method GET

app.get('/register', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };

  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_login', templateVars);
});

// @route /register, /login, /logout
// @desc Allow users to authenticate through requests made on page
// @method GET

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
    return new ErrorMessage(
      'User not found',
      'Could not find user with provided email.'
    ).sendError(res);
  }

  const comparePassword = bcrypt.compareSync(password, user.password)
  if (!comparePassword) {
    return new ErrorMessage(
      'Incorrect credentials',
      'Password is incorrect, please try again.'
    ).sendError(res);
  }

  res.cookie('user_id', user.id, { httpOnly: true });
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const userId = generateRandomString(chars, 6);
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (user) {
    return new ErrorMessage(
      'User is exists',
      'User with the provided email already exists.'
    ).sendError(res);
  }

  const hashedPassword = bcrypt.hashSync(password, 10)

  console.log("hashed password:", hashedPassword)
  users[userId] = {
    email,
    password: hashedPassword,
    id: userId,
  };

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/clear', (req, res) => {
  res.clearCookie('user_id');
  res.send("<span>Cleared<a href='/urls'>Go back</a></span>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
