const { assert } = require('chai');

const { getUserByEmail, getUserById, urlsForUser } = require('../helpers.js');

const testUsers = {
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
  user3RandomID: {
    id: 'user3RandomID',
    email: 'user3@example.com',
    password: 'dishwasher-funk',
  },
};

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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if passed in email that does not exist', function () {
    const user = getUserByEmail('user@com', testUsers);
    const expected = undefined;
    assert.equal(user, expected);
  });
});

describe('urlsForUser', function () {
  it('should return empty object if user is not in test users', function () {
    const urls = urlsForUser('asdf', urlDatabase);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
  it('should return urls if user exists, and has urls added', function () {
    const urls = urlsForUser('user2RandomID', urlDatabase);
    const expected = {
      '9sm5xK': {
        longURL: 'http://www.google.com',
        userId: 'user2RandomID',
      },
    };
    assert.deepEqual(urls, expected);
  });
  it('should return empty object if user exists, but no urls added', function () {
    const urls = urlsForUser('user3RandomID', urlDatabase);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
});

describe('getUserById', function () {
  it('should return null if user does not exist', function () {
    const user = getUserById('user4RandomID', testUsers);
    const expected = null;
    assert.equal(user, expected);
  });

  it('should return user if user id exists', function () {
    const user = getUserById('user2RandomID', testUsers);
    const expected = {
      id: 'user2RandomID',
      email: 'user2@example.com',
      password: 'dishwasher-funk',
    };
    assert.deepEqual(user, expected);
  });
});
