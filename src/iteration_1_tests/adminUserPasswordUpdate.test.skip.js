/* import { clear } from './other.js';
import { adminAuthRegister, adminUserPasswordUpdate, adminAuthLogin } from './auth.js';

beforeEach(() => {
  clear();
});

let user1;
beforeEach(() => {
  user1 = adminAuthRegister('leah123@gmail.com', 'originalpassword7', 'Leah', 'Emb');
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    expect(adminUserPasswordUpdate(-1, 'originalpassword7', 'newpassword123')).toStrictEqual({ error: expect.any(String) });
  });

  test('Incorrect old password', () => {
    expect(adminUserPasswordUpdate(user1.authUserId, 'wrongpassword432', 'newpassword123')).toStrictEqual({ error: expect.any(String) });
  });

  test('Same old password and new password', () => {
    expect(adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', 'originalpassword7')).toStrictEqual({ error: expect.any(String) });
  });

  test('new password has been used before', () => {
    adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', 'changedpasswordonce78');
    adminUserPasswordUpdate(user1.authUserId, 'changedpasswordonce78', 'newpassword567');
    expect(adminUserPasswordUpdate(user1.authUserId, 'newpassword567', 'originalpassword7')).toStrictEqual({ error: expect.any(String) });
  });

  test.each(['aaaaa', 'AAAAA', 'ABC123', 'Le+89!', 'morethantwentycharactersssssss', '1357908642', '>-<', '!@#$%^&*()', 'aBC745'])
  ('Invalid password', (newpassword) => {
    expect(adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', newpassword)).toStrictEqual({ error: expect.any(String) });
  });
});

describe(' Successful Cases', () => {
  test('test return type of function', () => {
    expect(adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', 'changedpasswordonce78')).toStrictEqual({});
  });

  test('successfully updates one password once', () => {
    adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', 'changedpasswordonce78');
    expect(adminAuthLogin('leah123@gmail.com', 'originalpassword7')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('leah123@gmail.com', 'changedpasswordonce78')).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('successfully updates password multiple times for multiple users', () => {
    const user2 = adminAuthRegister('siluni@gmail.com', 'inlisu194', 'Siluni', 'Fernando');
    adminUserPasswordUpdate(user1.authUserId, 'originalpassword7', 'changedpasswordonce78');
    adminUserPasswordUpdate(user1.authUserId, 'changedpasswordonce78', 'newpassword792');
    adminUserPasswordUpdate(user2.authUserId, 'inlisu194', 'passwordnew123');
    adminUserPasswordUpdate(user2.authUserId, 'passwordnew123', 'abcde6792');
    expect(adminAuthLogin('leah123@gmail.com', 'originalpassword7')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('leah123@gmail.com', 'changedpasswordonce78')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('leah123@gmail.com', 'newpassword792')).toStrictEqual({ authUserId: expect.any(Number) });
    expect(adminAuthLogin('siluni@gmail.com', 'inlisu194')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('siluni@gmail.com', 'passwordnew123')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('siluni@gmail.com', 'abcde6792')).toStrictEqual({ authUserId: expect.any(Number) });
  });
});
*/
