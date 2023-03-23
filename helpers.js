const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return undefined;
};

// Random character index
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

const getUserById = (userId, database) => {
  for (const id in database) {
    if (database[id].id === userId) {
      return database[id];
    }
  }
  return null;
};

const urlsForUser = (userId, database) => {
  let result = {};

  for (const urlId in database) {
    if (userId === database[urlId].userId) {
      result[urlId] = database[urlId];
    }
  }

  return result;
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

  renderError(res, user) {
    res.status(404).render('urls_error', {
      user,
      error: this.error,
      message: this.message,
    });
  }
}

module.exports = {
  generateRandomString,
  getUserById,
  urlsForUser,
  getUserByEmail,
  chars,
  ErrorMessage,
};
