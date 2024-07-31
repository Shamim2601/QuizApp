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
});

describe('Unsuccessful Cases', () => {
  test('Invalid Token', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: "can'tbevalidrite?" }, timeout: TIMEOUT_MS });
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Successful Cases', () => {
  test('Empty Trash', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: session } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ quizzes: [] });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Quiz in trash', () => {
    request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token: session } });
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token: session } });
    expect(JSON.parse(res.body.toString())).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quizId,
            name: expect.any(String)
          }
        ]
      }
    );
    expect(res.statusCode).toStrictEqual(200);
  });
});
