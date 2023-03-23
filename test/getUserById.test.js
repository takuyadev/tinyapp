import { assert } from 'chai';
import { getUserById } from '../utils/index.js';
import { USER_DATABASE } from '../data/database/user_database.js';

describe('getUserById()', function () {
  it('should return null if user does not exist', function () {
    const user = getUserById('user4RandomID', USER_DATABASE);
    const expected = null;
    assert.equal(user, expected);
  });

  it('should return user if user id exists', function () {
    const user = getUserById('user2RandomID', USER_DATABASE);
    const expected = {
      id: 'user2RandomID',
      email: 'user2@example.com',
      password: 'dishwasher-funk',
    };
    assert.deepEqual(user, expected);
  });
});