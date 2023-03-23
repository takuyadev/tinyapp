import { PORT, RANDOM_CHARS } from './data/constants.js';
import { URL_DATABASE } from './data/database/url_database.js';
import { USER_DATABASE } from './data/database/user_database.js';
import {
  getUserByEmail,
  getUserById,
  generateRandomString,
  urlsForUser,
} from './utils/index.js';
import express from 'express';
import cookieSession from 'cookie-session';
import bcryptjs from 'bcryptjs';
import morgan from 'morgan';

// Server
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(
  cookieSession({
    name: 'user_id',
    keys: ['123'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// @route /urls
// @desc Renders and allow users to see shortened URLS
// @method GET

// @details Redirect users from the root page t
// Login or Url page depending on authentication
app.get('/', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (!user) {
    res.redirect('/login');
  }

  res.redirect('/urls');
});

// @details Show all URLS that the user has
app.get('/urls', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      'Please login first before viewing your URLs.',
      '/login'
    ).renderError(res, user);
  }

  const urls = urlsForUser(req.session.user_id, URL_DATABASE);

  const templateVars = {
    urls: urls,
    user: USER_DATABASE[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

// @details Create new urls through form
app.get('/urls/new', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    urls: URL_DATABASE,
    user: USER_DATABASE[req.session.user_id],
  };

  res.render('urls_new', templateVars);
});

// @details View edit URL page, and allow to edit longURL through form
app.get('/urls/:id', (req, res) => {
  const user = USER_DATABASE[req.session.user_id];

  if (!URL_DATABASE[req.params.id]) {
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

  if (URL_DATABASE[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to view this URL'
    ).renderError(res, user);
  }

  // If all checks passes
  const templateVars = {
    longURL: URL_DATABASE[req.params.id].longURL,
    created: URL_DATABASE[req.params.id].created,
    visited: URL_DATABASE[req.params.id].visited,
    id: req.params.id,
    user: USER_DATABASE[req.session.user_id],
  };

  res.render('urls_show', templateVars);
});

// @route /urls, /urls/:id
// @desc Updates shortened URLS
// @method POST

// @details Add URL to database
app.post('/urls', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (!user) {
    return new ErrorMessage(
      'Unauthorized',
      "You're not authorized to add new pages. Please login again."
    ).renderError(res, user);
  }

  const id = generateRandomString(RANDOM_CHARS, 6);

  // Set new data in new id
  URL_DATABASE[id] = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
    created: new Date(),
    visited: 0,
  };

  res.redirect('/urls/' + id);
});

// @details Delete URL on database
app.post('/urls/:id/delete', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (!URL_DATABASE[req.params.id]) {
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

  if (URL_DATABASE[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to edit this URL'
    ).renderError(res, user);
  }

  delete URL_DATABASE[req.params.id];
  res.redirect('/urls');
});

// @details Update URL based on params
app.post('/urls/:id', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (!URL_DATABASE[req.params.id]) {
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

  if (URL_DATABASE[req.params.id].userId !== req.session.user_id) {
    return new ErrorMessage(
      'Unauthorized URL',
      'You are unauthorized to edit this URL'
    ).renderError(res, user);
  }

  URL_DATABASE[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// @route /u/:id
// @desc Redirects user to website through shortened URL
// @method GET

// @details Go to longURL based on provided short url
app.get('/u/:id', (req, res) => {
  const user = USER_DATABASE[req.session.user_id];
  const url = URL_DATABASE[req.params.id];

  if (!url) {
    return new ErrorMessage(
      'Invalid URL',
      'This URL does not exist. please try another URL'
    ).renderError(res, user);
  }

  URL_DATABASE[req.params.id].visited += 1;
  res.redirect(longURL, user);
});

// @routes /register, /login
// @desc Renders pages for authentication
// @method GET

// @details Show register form based on current authentication
app.get('/register', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (user) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: URL_DATABASE,
    user: USER_DATABASE[req.session.user_id],
  };

  res.render('urls_register', templateVars);
});

// @details Show login form based on current authenticatoin
app.get('/login', (req, res) => {
  const user = getUserById(req.session.user_id, USER_DATABASE);

  if (user) {
    res.redirect('/urls');
  }

  const templateVars = {
    urls: URL_DATABASE,
    user: USER_DATABASE[req.session.user_id],
  };

  res.render('urls_login', templateVars);
});

// @route /register, /login, /logout
// @desc Allow users to authenticate through requests made on page
// @method GET

// @details Update user session if provided email and password matches with database
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, USER_DATABASE);

  if (!user) {
    return new ErrorMessage(
      'User not found',
      'Could not find user with provided email.'
    ).renderError(res, user);
  }

  const comparePassword = bcryptjs.compareSync(password, user.password);

  if (!comparePassword) {
    return new ErrorMessage(
      'Incorrect credentials',
      'Password is incorrect, please try again.'
    ).renderError(res, user);
  }

  // If all checks passes, provide user with auth cookie
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// @details Update user session if provided email and password matches with database
app.post('/register', (req, res) => {
  const userId = generateRandomString(RANDOM_CHARS, 6);
  const { email, password } = req.body;
  const user = getUserByEmail(email, USER_DATABASE);

  if (user) {
    return new ErrorMessage(
      'User is exists',
      'User with the provided email already exists.'
    ).renderError(res, user);
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  USER_DATABASE[userId] = {
    email,
    password: hashedPassword,
    id: userId,
  };

  // If all checks passes, provide user with auth cookie
  req.session.user_id = userId;
  res.redirect('/urls');
});

// Clear cookies when logout is pressed, and redirect
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
