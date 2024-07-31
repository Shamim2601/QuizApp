
/* import { clear } from './other.js';
import { adminUserDetailsUpdate, adminAuthRegister, adminUserDetails, adminAuthLogin } from './auth.js';

beforeEach(() => {
  clear();
});

let user1, user2, user3;
beforeEach(() => {
  user1 = adminAuthRegister('leah123@gmail.com', 'asdfgh123', 'Leah', 'Emb');
  user2 = adminAuthRegister('bernadette123@gmail.com', 'asdfgh123', 'Bernadatte', 'Roche');
  user3 = adminAuthRegister('siluni@gmail.com', 'inlisu194', 'Siluni', 'Fernando');
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    expect(adminUserDetailsUpdate(-1, 'abcd1234@gmail.com', 'Bernadette', 'Roche')).toStrictEqual({ error: expect.any(String) });
  });

  test('Email is already taken', () => {
    expect(adminUserDetailsUpdate(user1.authUserId, 'bernadette123@gmail.com', 'Bernadette', 'Roche')).toStrictEqual({ error: expect.any(String) });
    expect(adminUserDetailsUpdate(user2.authUserId, 'leah123@gmail.com', 'Maria', 'Mathew')).toStrictEqual({ error: expect.any(String) });
  });

  test.each(['notanemail', 'www.google.com', '!*!7(226@.com', '@gmail.com'])
  ('Invalid Email', (email) => {
    expect(adminUserDetailsUpdate(user1.authUserId, email, 'Bernadette', 'Roche')).toStrictEqual({ error: expect.any(String) });
  });

  test.each(['!!!!!', 'a', '123456', 'Le+H78', 'morethantwentycharactersssssss', 'H', '>-<'])
  ('Invalid Namefirst', (namefirst) => {
    expect(adminUserDetailsUpdate(user1.authUserId, 'maria4254@gmail.com', namefirst, 'Roche')).toStrictEqual({ error: expect.any(String) });
  });

  test.each(['!!!!!', 'a', '123456', 'Le+H78', 'morethantwentycharactersssssss', 'H', '>-<'])
  ('Invalid nameLast', (namelast) => {
    expect(adminUserDetailsUpdate(user1.authUserId, 'maria4254@gmail.com', 'Maria', namelast)).toStrictEqual({ error: expect.any(String) });
  });
});

describe(' Successful Cases', () => {
  test('test return type of function', () => {
    expect(adminUserDetailsUpdate(user1.authUserId, 'sheldon.cooper@gmail.com', 'Sheldon', 'Cooper')).toStrictEqual({});
  });

  test('successfully updates one user', () => {
    adminUserDetailsUpdate(user1.authUserId, 'sheldon.cooper@gmail.com', 'Leah', 'Cooper');
    expect(adminAuthRegister('sheldon.cooper@gmail.com', 'password423', 'Abcd', 'Efgh')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('leah123@gmail.com', 'asdfgh123')).toStrictEqual({ error: expect.any(String) });
    expect(adminUserDetails(user1.authUserId)).toStrictEqual({
      user:
            {
              userId: user1.authUserId,
              name: 'Leah Cooper',
              email: 'sheldon.cooper@gmail.com',
              numSuccessfulLogins: expect.any(Number),
              numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
    });
  });

  test('successfully updates multiple user', () => {
    adminUserDetailsUpdate(user1.authUserId, 'abcd@gmail.com', 'Sheldon', 'Cooper');
    adminUserDetailsUpdate(user1.authUserId, 'abcd@gmail.com', 'Cooper', 'Sheldon');
    adminUserDetailsUpdate(user2.authUserId, 'anjie.em@gmail.com', 'Anjie', 'Mathews');
    adminUserDetailsUpdate(user3.authUserId, 'amanda.per@gmail.com', 'Amanda', 'Pereira');
    expect(adminUserDetails(user1.authUserId)).toStrictEqual({
      user:
            {
              userId: user1.authUserId,
              name: 'Cooper Sheldon',
              email: 'abcd@gmail.com',
              numSuccessfulLogins: expect.any(Number),
              numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
    });

    expect(adminUserDetails(user2.authUserId)).toStrictEqual({
      user:
            {
              userId: user2.authUserId,
              name: 'Anjie Mathews',
              email: 'anjie.em@gmail.com',
              numSuccessfulLogins: expect.any(Number),
              numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
    });

    expect(adminUserDetails(user3.authUserId)).toStrictEqual({
      user:
            {
              userId: user3.authUserId,
              name: 'Amanda Pereira',
              email: 'amanda.per@gmail.com',
              numSuccessfulLogins: expect.any(Number),
              numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
    });
  });
});
*/
