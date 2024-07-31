import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let user2: {token: string};
let quiz1: {quizId:number};
// add question after the route is implemented
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'leah123@gmail.com',
      password: 'asdfgh123',
      nameFirst: 'Leah',
      nameLast: 'Emb'
    }
  });
  const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'bernadette123@gmail.com',
      password: 'asdfgh123',
      nameFirst: 'Bernadatte',
      nameLast: 'Roche'
    }
  });
  user1 = JSON.parse(res1.body.toString());
  user2 = JSON.parse(res2.body.toString());
  const quiz1Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'first quiz', description: 'easy' } });
  quiz1 = JSON.parse(quiz1Res.body.toString());
});

describe('Error Cases', () => {
  test('Useremail not real user', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'fakeemail123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Useremail is currently loginned', () => {
    const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'bernadette123@gmail.com', password: 'asdfgh123' } });
    const loginnedUser = JSON.parse(loginRes.body.toString());
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: loginnedUser.token, userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Quiz name is already used by user', () => {
    request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'first quiz', description: 'hard' } });
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('token is empty or invalid', () => {
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: '-1', userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: '', userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz does not exist', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId - 8}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Quiz is not owned by user', () => {
    const quiz2Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'second quiz', description: 'hard' } });
    const quiz2 = JSON.parse(quiz2Res.body.toString());
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Successful Cases', () => {
  test('test return type of function', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    // const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });

  test('Successfully transfers one quiz', () => {
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    const quizListRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user2.token } });
    expect(JSON.parse(quizListRes.body.toString())).toStrictEqual({ quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' }] }
    );
  });

  test('Successfully transfers multiple quizes', () => {
    const quiz2Res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'my own quiz', description: 'hard' } });
    const quiz2 = JSON.parse(quiz2Res.body.toString());
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user1.token, userEmail: 'bernadette123@gmail.com' } });
    let quizListRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user2.token } });
    expect(JSON.parse(quizListRes.body.toString())).toStrictEqual({ quizzes: [{ quizId: quiz2.quizId, name: 'my own quiz' }, { quizId: quiz1.quizId, name: 'first quiz' }] });
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/transfer`, { json: { token: user2.token, userEmail: 'leah123@gmail.com' } });
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/transfer`, { json: { token: user2.token, userEmail: 'leah123@gmail.com' } });
    quizListRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user1.token } });
    expect(JSON.parse(quizListRes.body.toString())).toStrictEqual({ quizzes: [{ quizId: quiz1.quizId, name: 'first quiz' }, { quizId: quiz2.quizId, name: 'my own quiz' }] });
    quizListRes = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: user2.token } });
    expect(JSON.parse(quizListRes.body.toString())).toStrictEqual({ quizzes: [] });
  });
});
