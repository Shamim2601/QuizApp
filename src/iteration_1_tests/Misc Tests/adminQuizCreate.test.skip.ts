/*
import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js';

let user1;
beforeEach(() => {
  clear();
  user1 = adminAuthRegister('wamia123@gmail.com', 'originalpassword6', 'Wamia', 'Chy');
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    expect(adminQuizCreate(-2, 'Math test', 'Tests math skills')).toStrictEqual({ error: expect.any(String) });
  });

  test.each([
    { name: 'abcd**', description: '' },
    { name: 'in', description: '' },
    { name: 'abcdefghijklmnopqrstuvwxyz12345', description: '' },
    { name: '**', description: 'abcdefghijklmnopqrstuvwxyz12345abcdefghijklmnopqrstuvwxyz12345abcdefghijklmnopqrstuvwxyz12345abcdefghij' }
  ])('returns an error for name=$name and description=$description', ({ name, description }) => {
    expect(adminQuizCreate(user1.authUserId, name, description)).toStrictEqual({ error: expect.any(String) });
  });
  test('Name is already used by the current logged in user for another quiz.', () => {
    let quiz1;
    let quiz2;

    quiz1 = adminQuizCreate(user1.authUserId, 'Eng test', 'Tests eng skills');
    quiz2 = adminQuizCreate(user1.authUserId, 'Eng test', 'Tests eng skills');
    expect(quiz2).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('A valid quiz', () => {
    expect(adminQuizCreate(user1.authUserId, 'Chem test', 'Tests chem skills')).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('A valid quiz with empty description', () => {
    expect(adminQuizCreate(user1.authUserId, 'Comp test', '')).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Valid quizzes with different quizIds', () => {
    let quiz1;
    let quiz2;
    quiz1 = adminQuizCreate(user1.authUserId, 'Phys test', 'Tests phys skills');
    expect(adminQuizCreate(user1.authUserId, 'Bio test', 'Tests bio skills')).not.toStrictEqual({ quizId: quiz1.quizId });
  });
});
    adminQuizCreate(user1.authUserId, 'Eng test', 'Tests eng skills');
    const quiz2 = adminQuizCreate(user1.authUserId, 'Eng test', 'Tests eng skills');
    expect(quiz2).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('A valid quiz', () => {
    expect(adminQuizCreate(user1.authUserId, 'Chem test', 'Tests chem skills')).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('A valid quiz with empty description', () => {
    expect(adminQuizCreate(user1.authUserId, 'Comp test', '')).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Valid quizzes with different quizIds', () => {
    let quiz1;
    let quiz2;
    quiz1 = adminQuizCreate(user1.authUserId, 'Phys test', 'Tests phys skills');
    expect(adminQuizCreate(user1.authUserId, 'Bio test', 'Tests bio skills')).not.toStrictEqual({ quizId: quiz1.quizId });
  });
});
*/
