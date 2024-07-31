import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';
import { getData } from './dataStore.js';

describe('Clear Function', () => {
  let user1;

  beforeEach(() => {
    user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
    adminQuizCreate(user1.authUserId, 'First Quiz', 'This is the first quiz');
    adminQuizCreate(user1.authUserId, 'Second Quiz', 'This is the second quiz');
  });

  test('clear function resets the state of the application', () => {
    clear();
    const data = getData();
    expect(data).toStrictEqual({
      users: [],
      quizzes: {},
    });
  });

  test('clear function returns an empty object', () => {
    expect(clear()).toStrictEqual({});
  });
});
