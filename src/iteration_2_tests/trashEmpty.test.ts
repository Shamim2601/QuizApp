import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let quiz1: {quizId: number};
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res.body.toString());
  const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'first quiz', description: 'easy' } });
  quiz1 = JSON.parse(quizRes.body.toString());
});

describe('Error Cases', () => {
  test('One or more of the Quiz IDs is not currently in the trash', () => {
    const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: user1.token, quizIds: [quiz1.quizId] } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: quiz1.quizId } });
    const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: '1', quizIds: [quiz1.quizId] } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Valid token is provided, but one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: quiz1.quizId } });
    const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: user1.token, quizIds: [4] } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Successful Cases', () => {
  test('Check return type and removes one quiz', () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: user1.token } });
    const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: user1.token, quizIds: [quiz1.quizId] } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
    const viewtrash = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: user1.token } });
    expect(JSON.parse(viewtrash.body.toString())).toStrictEqual({ quizzes: [] });
  });

  test('Empties trash successfully', () => {
    let quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'my quiz', description: 'hard' } });
    const quiz2 = JSON.parse(quizRes.body.toString());
    quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'another quiz', description: 'okay' } });
    const quiz3 = JSON.parse(quizRes.body.toString());
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: user1.token } });
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}`, { qs: { token: user1.token } });
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quiz3.quizId}`, { qs: { token: user1.token } });
    request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token: user1.token, quizIds: [quiz1.quizId, quiz2.quizId] } });
    const viewtrash = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: user1.token } });
    expect(JSON.parse(viewtrash.body.toString())).toStrictEqual({
      quizzes: [{
        quizId: quiz3.quizId,
        name: 'another quiz'
      }]
    });
  });
});
