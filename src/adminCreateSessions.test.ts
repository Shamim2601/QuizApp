import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1: {token: string};
let quiz1: {quizId: number};
let question: {questionId: number};
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

  const qRes = request('POST', SERVER_URL + `/v2/admin/quiz/${quiz1.quizId}/question`, body);
  question = JSON.parse(qRes.body.toString());
});

describe('Error Cases', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token + 1 },
      json: { autoStartNum: 20 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist", () => {
    let res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'ben@gmail.com', password: 'mypassword7', nameFirst: 'ben', nameLast: 'tom' } });
    const user2 = JSON.parse(res.body.toString());
    const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user2.token }, json: { name: "ben's quiz", description: 'ok' } });
    const quiz2 = JSON.parse(quizRes.body.toString());
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('autoStartNum is a number greater than 50', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 51 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('10 sessions that are not in END state currently exist for this quiz', () => {
    for (let i = 0; i < 10; i++) {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
        headers: { token: user1.token },
        json: { autoStartNum: 20 }
      }
      );
    }
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('The quiz does not have any questions in it', () => {
    request('DELETE', SERVER_URL + `/v2/admin/quiz/${quiz1.quizId}/question/${question.questionId}`, {
      headers: {
        token: user1.token,
      }
    });
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('The quiz is in trash', () => {
    request('DELETE', SERVER_URL + `/v2/admin/quiz/${quiz1.quizId}`, { headers: { token: user1.token } });
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful Cases', () => {
  // add test once view sessions is implemented - for multiple users and multiple sessions
  test('succesfully adds one quiz', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
      headers: { token: user1.token },
      json: { autoStartNum: 20 }
    }
    );
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ sessionId: expect.any(Number) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
