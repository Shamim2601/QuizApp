import request from 'sync-request-curl';
import { port, url } from '../config.json';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session: string;
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

describe('Failed quiz description update', () => {
  test('Not a valid token', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/description`, {
      json: {
        token: 'abcd',
        description: 'Updated math skills test description'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Invalid quiz ID', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/quiz/99999/description', {
      json: {
        token: session,
        description: 'Updated math skills test description'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Not a valid description', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/description`, {
      json: {
        token: session,
        description: 'superlongdescriptionletshopethisoneislongerthan100characterssothatitbreaksthelimityapyapyapyapyapyapyapyapyapyapaypapyapy'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful quiz description update', () => {
  test('A valid quiz description update', () => {
    request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/description`, {
      json: {
        token: session,
        description: 'Updated math skills test description'
      }
    });
    // expect(res.statusCode).toStrictEqual(200);
    // Add more expectations as needed for successful update
  });
});
