import { clear } from '../other.js';
import { adminAuthRegister } from '../auth.js';
import { adminQuizList, adminQuizCreate } from '../quiz.js';

beforeEach(() => {
  clear();
});

let user1;
beforeEach(() => {
  user1 = adminAuthRegister('leah123@gmail.com', 'originalpassword7', 'Leah', 'Emb');
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    expect(adminQuizList(-1)).toStrictEqual({ error: expect.any(String) });
  });
});

describe(' Successful Cases', () => {
  test('No quizes owned by user', () => {
    expect(adminQuizList(user1.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('successfully lists quizes owned by one user', () => {
    const quiz1 = adminQuizCreate(user1.authUserId, 'first quiz', 'easy');
    const quiz2 = adminQuizCreate(user1.authUserId, 'second quiz', 'medium');
    const quiz3 = adminQuizCreate(user1.authUserId, 'third quiz', 'hard');
    expect(adminQuizList(user1.authUserId)).toStrictEqual({
      quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' },
        { quizId: quiz2.quizId, name: 'second quiz' },
        { quizId: quiz3.quizId, name: 'third quiz' }]
    });
  });

  test('successfully lists quizes owned by multiple users', () => {
    const user2 = adminAuthRegister('myemail.1234@gmail.com', 'password7892', 'Abcd', 'Efg');
    const user3 = adminAuthRegister('maria.mathew739@gmail.com', 'mylogin678', 'Maria', 'Mathew');
    const quiz1 = adminQuizCreate(user1.authUserId, 'first quiz', 'easy');
    const quiz2 = adminQuizCreate(user1.authUserId, 'second quiz', 'medium');
    const quiz3 = adminQuizCreate(user2.authUserId, 'third quiz', 'hard');
    const quiz4 = adminQuizCreate(user2.authUserId, 'random quiz', 'hard');
    const quiz5 = adminQuizCreate(user3.authUserId, 'my quiz', 'okay');
    expect(adminQuizList(user1.authUserId)).toStrictEqual({
      quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' },
        { quizId: quiz2.quizId, name: 'second quiz' }]
    });
    expect(adminQuizList(user2.authUserId)).toStrictEqual({
      quizzes: [{ quizId: quiz3.quizId, name: 'third quiz' },
        { quizId: quiz4.quizId, name: 'random quiz' }]
    });
    expect(adminQuizList(user3.authUserId)).toStrictEqual({
      quizzes: [{ quizId: quiz5.quizId, name: 'my quiz' }]
    });
  });
});
