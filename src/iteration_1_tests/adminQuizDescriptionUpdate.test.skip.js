/*
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate, adminQuizDescriptionUpdate } from './quiz.js';
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
    expect(adminQuizDescriptionUpdate(-1, quiz1.quizId, 'Updated description')).toStrictEqual({ error: 'User is not a valid user' });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    expect(adminQuizDescriptionUpdate(user1.authUserId, -1, 'Updated description')).toStrictEqual({ error: 'Invalid Quiz Id!' });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    expect(adminQuizDescriptionUpdate(user2.authUserId, quiz1.quizId, 'Updated description')).toStrictEqual({ error: 'This quiz does not belong to the logged in user' });
  });

  test('Description is more than 100 characters in length', () => {
    expect(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, 'A'.repeat(101))).toStrictEqual({ error: 'Invalid description! Description should be less than a hundred characters.' });
  });
});

describe('Successful Cases', () => {
  test('successfully updates the quiz description', () => {
    expect(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, 'Updated description')).toStrictEqual({});
  });

  test('check updated quiz description', () => {
    adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, 'Updated description');
    const quizzes = getData().quizzes[user1.authUserId];
    expect(quizzes.find(quiz => quiz.quizId === quiz1.quizId).description).toBe('Updated description');
  });
});
*/
