import request from 'sync-request-curl';
import { port, url } from '../config.json';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session: string;
let quizId:number;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'thinwhiteduke@gmail.com',
      password: 'station2station',
      nameFirst: 'David',
      nameLast: 'Bowie'
    }
  });
  session = JSON.parse(res.body.toString()).token;

  const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: session,
      name: 'Math test',
      description: 'Tests math skills'
    }
  });
  quizId = JSON.parse(quizRes.body.toString()).quizId;
  request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token: session } });
});

describe('Unsuccessful Cases', () => {
  test('Quiz not in trash', () => {
    const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: session,
        name: 'New test',
        description: 'Tests math skills'
      }
    });
    quizId = JSON.parse(quizRes.body.toString()).quizId;
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: session } });
    expect(res.statusCode).toStrictEqual(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz name already used', () => {
    console.log(quizId);
    request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: session,
        name: 'Math test',
        description: 'Tests math skills'
      }
    });
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: session } });
    expect(res.statusCode).toStrictEqual(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    quizId = null;
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: 'nowaythisisavalidtoken' } });
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Quiz Id', () => {
    // Should still be black box as only one quiz exists
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 900}/restore`, { json: { token: session } });
    expect(res.statusCode).toStrictEqual(403);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('Successful Return Type + Test Back In Quizzes', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: session } });
    expect(res.statusCode).toStrictEqual(200);
    const res2 = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: session } });
    console.log(JSON.parse(res2.body.toString()));
    expect(JSON.parse(res2.body.toString())).toStrictEqual({
      quizzes: [{
        name: 'Math test',
        quizId: expect.any(Number)
      }
      ]
    });
  });
});
