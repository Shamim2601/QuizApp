import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let quiz1: {quizId: number};
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
        question: 'What is the capitial city of Australia',
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
});

describe('Error Cases', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );

    const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/sessions`,
      { headers: { token: user1.token + 1 } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Valid token is provided, but one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", () => {
    let res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'ben@gmail.com', password: 'mypassword7', nameFirst: 'ben', nameLast: 'tom' } });
    const user2 = JSON.parse(res.body.toString());
    const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user2.token }, json: { name: "ben's quiz", description: 'ok' } });
    const quiz2 = JSON.parse(quizRes.body.toString());
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );
    res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/sessions`,
      { headers: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Successful Cases', () => {
  test('Quiz has no sessions', () => {
    const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/sessions`,
      { headers: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      activeSessions: [],
      inactiveSessions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Succesfully returns active and inactive sessions', () => {
    const sessionIds = [];
    for (let i = 0; i < 3; i++) {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
        headers: { token: user1.token },
        json: { autoStartNum: 20 }
      }
      );
      const session = JSON.parse(res.body.toString());
      sessionIds.push(session.sessionId);
    }
    request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${sessionIds[0]}`, { headers: { token: user1.token }, json: { action: 'END' } });
    request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${sessionIds[1]}`, { headers: { token: user1.token }, json: { action: 'NEXT_QUESTION' } });
    const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/sessions`,
      { headers: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      activeSessions: [sessionIds[1], sessionIds[2]],
      inactiveSessions: [sessionIds[0]]
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
