
// import { clear } from './other.js';
/* import { adminQuizCreate, adminQuizRemove, adminQuizInfo } from './quiz.js';

import { adminAuthRegister } from './auth.js';

let user1;
let quiz1;
beforeEach(() => {
  clear();
  user1 = adminAuthRegister('wamia123@gmail.com', 'originalpassword6', 'Wamia', 'Chy');
  quiz1 = adminQuizCreate(user1.authUserId, 'Fin test', 'Tests finance skills');
});

describe('Error Cases', () => {
  test('Not a valid user and not a valid quiz', () => {
    expect(adminQuizRemove(-1, 1234)).toStrictEqual({ error: expect.any(String) });
  });

  test('Not a valid quiz', () => {
    expect(adminQuizRemove(user1.authUserId, 1234)).toStrictEqual({ error: expect.any(String) });
  });

  test('Not a valid user', () => {
    expect(adminQuizRemove(-1, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove the same quiz twice', () => {
    expect(adminQuizRemove(user1.authUserId, quiz1.quizId)).toStrictEqual({});
    expect(adminQuizRemove(user1.authUserId, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('Quiz removed successfully', () => {
    expect(adminQuizRemove(user1.authUserId, quiz1.quizId)).toStrictEqual({});
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});
*/
