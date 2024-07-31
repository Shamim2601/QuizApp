/* import { adminQuizCreate, adminQuizInfo, adminQuizRemove } from './quiz';
import { clear } from './other';

let user1;
let quiz1;
beforeEach(() => {
  clear();
  user1 = adminAuthRegister('wamia123@gmail.com', 'originalpassword6', 'Wamia', 'Chy');
  quiz1 = adminQuizCreate(user1.authUserId, 'Fin test', 'Tests finance skills');
});

describe('Error Cases', () => {
  test('Not a valid user and not a valid quiz', () => {
    expect(adminQuizInfo(-1, 1234)).toStrictEqual({ error: expect.any(String) });
  });

  test('Not a valid quiz', () => {
    expect(adminQuizInfo(user1.authUserId, 1234)).toStrictEqual({ error: expect.any(String) });
  });

  test('Not a valid user', () => {
    expect(adminQuizInfo(-1, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Finding information of the removed quiz', () => {
    expect(adminQuizRemove(user1.authUserId, quiz1.quizId)).toStrictEqual({});
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test("Finding information of another user's quiz", () => {
    let user2;
    let quiz2;
    user2 = adminAuthRegister('wami321@gmail.com', 'originalpassword6', 'Wamia', 'Imtiaz');
    quiz2 = adminQuizCreate(user2.authUserId, 'Mark test', 'Tests marketing skills');
    expect(adminQuizInfo(user2.authUserId, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('Finding information of a quiz successfully', () => {
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toEqual(expect.objectContaining({ quizId: quiz1.quizId }));
  });

  test('Finding information of a quiz successfully from multiple quizzes', () => {
    let quiz2;
    let quiz3;
    quiz2 = adminQuizCreate(user1.authUserId, 'Mark test', 'Tests marketing skills');
    quiz3 = adminQuizCreate(user1.authUserId, 'Bus test', 'Tests business skills');
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toEqual(expect.objectContaining({ quizId: quiz1.quizId }));
  });
});
*/
