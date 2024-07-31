/* import { adminAuthRegister } from './auth.js';
import { adminQuizCreate, adminQuizNameUpdate } from './quiz.js';
import { getData } from './dataStore.js';

beforeEach(() => {
  clear();
});

let user1, user2, quiz1, quiz2;
beforeEach(() => {
  user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
  user2 = adminAuthRegister('user2@example.com', 'password123', 'User', 'Two');
  quiz1 = adminQuizCreate(user1.authUserId, 'First Quiz', 'This is the first quiz');
  quiz2 = adminQuizCreate(user1.authUserId, 'Second Quiz', 'This is the second quiz');
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    expect(adminQuizNameUpdate(-1, 1, 'Updated Quiz')).toStrictEqual({ error: 'User is not a valid user' });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    expect(adminQuizNameUpdate(user1.authUserId, -1, 'Updated Quiz')).toStrictEqual({ error: 'Invalid Quiz Id!' });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    expect(adminQuizNameUpdate(user2.authUserId, quiz1.quizId, 'Updated Quiz')).toStrictEqual({ error: 'This quiz does not belong to the logged in user' });
  });

  test('Name contains invalid characters', () => {
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Invalid@Name')).toStrictEqual({ error: 'Invalid quiz name input! Quiz name should not contain any symbols.' });
  });

  test('Name is less than 3 characters long', () => {
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'AB')).toStrictEqual({ error: 'Invalid quiz name input! Quiz name should be greater than two characters.' });
  });

  test('Name is more than 30 characters long', () => {
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'A'.repeat(31))).toStrictEqual({ error: 'Invalid quiz name input! Quiz name should be less than thirty characters.' });
  });

  test('Name is already used by the current logged in user for another quiz', () => {
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Second Quiz')).toStrictEqual({ error: 'Quiz name is already used by the current logged in user for another quiz.' });
  });
});

describe('Successful Cases', () => {
  test('successfully updates the quiz name', () => {
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Updated Quiz')).toStrictEqual({});
  });

  test('check updated quiz name', () => {
    adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Updated Quiz');
    const quizzes = getData().quizzes[user1.authUserId];
    expect(quizzes.find(quiz => quiz.quizId === quiz1.quizId).name).toBe('Updated Quiz');
  });
});

*/
