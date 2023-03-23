import { assert } from 'chai';
import { getUserByEmail } from '../utils/index.js';
import { USER_DATABASE } from '../data/database/user_database.js';

describe('getUserByEmail()', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail('user@example.com', USER_DATABASE);
    const expectedUserID = 'userRandomID';
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if passed in email that does not exist', function () {
    const user = getUserByEmail('user@com', USER_DATABASE);
    const expected = undefined;
    assert.equal(user, expected);
  });
});
