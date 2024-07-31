import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1: {token: string};
let quiz1: {quizId: number};
// let question: {questionId: number};
let gameSession: { sessionId: number }; // Declare `gameSession` here

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res.body.toString());
  const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user1.token }, json: { name: 'first quiz', description: 'easy' } });
  quiz1 = JSON.parse(quizRes.body.toString());
  const body = {
    headers: {
      token: user1.token,
    },
    json: {
      questionBody: {
        question: 'What is the capital city of Australia',
        duration: 120,
        points: 2,
        answers: [
          {
            answer: 'Sydney',
            correct: false,
          },
          {
            answer: 'Canberra',
            correct: true,
          },
          {
            answer: 'Melbourne',
            correct: false,
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  };

  request('POST', SERVER_URL + `/v2/admin/quiz/${quiz1.quizId}/question`, body);
  // question = JSON.parse(qRes.body.toString());
  const sRes = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
    headers: { token: user1.token },
    json: { autoStartNum: 20 }
  });
  gameSession = JSON.parse(sRes.body.toString()); // Assign to `gameSession`
});

describe('Error Cases', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/-1/session/${gameSession.sessionId}`, { headers: { token: 'invalidtokenlol' }, json: { action: 'NEXT_QUESTION' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist", () => {
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/-1/session/${gameSession.sessionId}`, { headers: { token: user1.token }, json: { action: 'NEXT_QUESTION' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('SessionId does not refer to a valid session in the quiz', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/-1`, { headers: { token: user1.token }, json: { action: 'NEXT_QUESTION' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid action', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${gameSession.sessionId}`, { headers: { token: user1.token }, json: { action: 'GET_FUNKY_LOL' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid action given current state of session', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${gameSession.sessionId}`, { headers: { token: user1.token }, json: { action: 'GO_TO_ANSWER' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Succesful Cases', () => {
  test('Successful return type', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${gameSession.sessionId}`, { headers: { token: user1.token }, json: { action: 'NEXT_QUESTION' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });
});
