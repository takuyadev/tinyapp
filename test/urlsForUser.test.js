import { URL_DATABASE } from '../data/database/url_database.js';
import { urlsForUser } from '../utils/index.js';
import { assert } from 'chai';

describe('urlsForUser()', function () {
  it('should return empty object if user is not in test users', function () {
    const urls = urlsForUser('asdf', URL_DATABASE);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
  it('should return urls if user exists, and has urls added', function () {
    const urls = urlsForUser('user2RandomID', URL_DATABASE);
    const expected = {
      '9sm5xK': {
        longURL: 'http://www.google.com',
        userId: 'user2RandomID',
        created: 0,
        visted: 0,
        uniqueVisits: [],
      },
    };
    assert.deepEqual(urls, expected);
  });
  it('should return empty object if user exists, but no urls added', function () {
    const urls = urlsForUser('user3RandomID', URL_DATABASE);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
});
