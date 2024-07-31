import request from 'sync-request-curl';
import { port, url } from '../config.json';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session:string;
let quizId: number;

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
});

describe('Failed quiz information', () => {
  test('Not a valid token', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId, {
      json: {
        token: 'abcd',
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
  test('Not a valid quizId', () => {
    const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId + 1}`, {
      qs: {
        token: session,
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Successful operation', () => {
  test('A valid quiz', () => {
    const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, {
      qs: {
        token: session,
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    const quiz1 = JSON.parse(res.body.toString());
    expect(quiz1).toEqual(expect.objectContaining({ quizId: quizId }));
  });
});
