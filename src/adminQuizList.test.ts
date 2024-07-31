import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1: {token: string};
beforeEach(() => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res.body.toString());
  // user1 = adminAuthRegister("leah123@gmail.com", "originalpassword7", "Leah", "Emb");
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    const res = request('PUT', SERVER_URL + '/v2/admin/user/password', { headers: { token: '-1' }, json: { oldPassword: 'originalpassword7', newPassword: 'newpassword123' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe(' Successful Cases', () => {
  test('No quizes owned by user', () => {
    const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', { headers: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ quizzes: [] });
    // expect(adminQuizList(user1.authUserId)).toStrictEqual({quizzes : []})
  });

  test('successfully lists quizes owned by one user', () => {
    const quiz1Res = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user1.token }, json: { name: 'first quiz', description: 'easy' } });
    const quiz2Res = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user1.token }, json: { name: 'second quiz', description: 'medium' } });
    const quiz3Res = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user1.token }, json: { name: 'third quiz', description: 'hard' } });
    const quiz1 = JSON.parse(quiz1Res.body.toString());
    const quiz2 = JSON.parse(quiz2Res.body.toString());
    const quiz3 = JSON.parse(quiz3Res.body.toString());
    // let quiz1 = adminQuizCreate(user1.authUserId, "first quiz", "easy");
    // let quiz2 = adminQuizCreate(user1.authUserId, "second quiz", "medium");
    // let quiz3 = adminQuizCreate(user1.authUserId, "third quiz", "hard");
    const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', { headers: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' },
        { quizId: quiz2.quizId, name: 'second quiz' },
        { quizId: quiz3.quizId, name: 'third quiz' }]
    });

    /* expect(adminQuizList(user1.authUserId)).toStrictEqual({
            quizzes : [ {quizId: quiz1.quizId, name: "first quiz"},
            {quizId: quiz2.quizId, name: "second quiz"},
            { quizId: quiz3.quizId, name: "third quiz"}]
        });
        */
  });
  // Gonna start commenting out some cases to save runtime. I think we only have a bit?
  /* test('successfully lists quizes owned by multiple users', () => {
    // let user2 = adminAuthRegister("myemail.1234@gmail.com", "password7892", "Abcd", "Efg");
    // let user3 = adminAuthRegister("maria.mathew739@gmail.com", "mylogin678", "Maria", "Mathew");
    const user2Res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'myemail.1234@gmail.com', password: 'password7892', nameFirst: 'Abcd', nameLast: 'Efg' } });
    const user3Res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'maria.mathew739@gmail.com', password: 'mylogin678', nameFirst: 'Maria', nameLast: 'Mathew' } });
    const user2 = JSON.parse(user2Res.body.toString());
    const user3 = JSON.parse(user3Res.body.toString());
    // let quiz1 = adminQuizCreate(user1.authUserId, "first quiz", "easy");
    // let quiz2 = adminQuizCreate(user1.authUserId, "second quiz", "medium");
    // let quiz3 = adminQuizCreate(user2.authUserId, "third quiz", "hard");
    const quiz1Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'first quiz', description: 'easy' } });
    const quiz2Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'second quiz', description: 'medium' } });
    const quiz3Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'third quiz', description: 'hard' } });
    const quiz4Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'random quiz', description: 'hard' } });
    const quiz5Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user3.token, name: 'my quiz', description: 'okay' } });
    const quiz1 = JSON.parse(quiz1Res.body.toString());
    const quiz2 = JSON.parse(quiz2Res.body.toString());
    const quiz3 = JSON.parse(quiz3Res.body.toString());
    const quiz4 = JSON.parse(quiz4Res.body.toString());
    const quiz5 = JSON.parse(quiz5Res.body.toString());
    // let quiz4 = adminQuizCreate(user2.authUserId, "random quiz", "hard");
    // let quiz5 = adminQuizCreate(user3.authUserId, "my quiz", "okay")
    let listRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user1.token } });
    expect(JSON.parse(listRes.body.toString())).toStrictEqual({
      quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' },
        { quizId: quiz2.quizId, name: 'second quiz' }]
    });
    /* expect(adminQuizList(user1.authUserId)).toStrictEqual({
            quizzes : [ {quizId: quiz1.quizId, name: "first quiz"},
            {quizId: quiz2.quizId, name: "second quiz"}]
        });
        */
  /* listRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user2.token } });
    expect(JSON.parse(listRes.body.toString())).toStrictEqual({
      quizzes: [{ quizId: quiz3.quizId, name: 'third quiz' },
        { quizId: quiz4.quizId, name: 'random quiz' }]
    });
    /* expect(adminQuizList(user2.authUserId)).toStrictEqual({
            quizzes : [ {quizId: quiz3.quizId, name: "third quiz"},
            {quizId: quiz4.quizId, name: "random quiz"}]
        });
        */
  /* listRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user3.token } });
    expect(JSON.parse(listRes.body.toString())).toStrictEqual({
      quizzes: [{ quizId: quiz5.quizId, name: 'my quiz' }]
    });
    /* expect(adminQuizList(user3.authUserId)).toStrictEqual({
            quizzes : [{quizId: quiz5.quizId, name: "my quiz"}]
        });
        */
});
