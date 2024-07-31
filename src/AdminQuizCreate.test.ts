import request from 'sync-request-curl';
import { port, url } from './config.json';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session:string;

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
});

describe('Failed quiz creation', () => {
  test('Not a valid token', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
      headers: {
        token: 'abcd'
      },
      json: {
        name: 'Math test',
        description: 'Tests math skills'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
    console.log(JSON.parse(res.body.toString()));
  });
  test('Not a valid name', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
      headers: {
        token: session
      },
      json: {
        name: '',
        description: 'Tests math skills'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful quiz creation', () => {
  test('A valid quiz', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
      headers: {
        token: session
      },
      json: {
        name: 'Math test',
        description: 'Tests math skills'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ quizId: expect.any(Number) });
    expect(res.statusCode).toStrictEqual(200);
    JSON.parse(res.body.toString());
    // expect(adminQuizInfo(getUserFromToken(session).authUserId, quiz1.quizId)).toEqual(expect.objectContaining({quizId: quiz1.quizId}));
  });
});
