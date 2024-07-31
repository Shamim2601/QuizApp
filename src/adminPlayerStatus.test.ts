import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let quiz1: {quizId: number};
// let question: {questionId: number};
let gameSession: { sessionId: number };
let playerId: number;

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
  const sRes = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/start`, {
    headers: { token: user1.token },
    json: { autoStartNum: 20 }
  });
  gameSession = JSON.parse(sRes.body.toString());

  const playerRes = request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: gameSession.sessionId, name: 'Wamia' } });
  playerId = JSON.parse(playerRes.body.toString()).playerId;
});

describe('Error Cases', () => {
  test('Invalid playerId', () => {
    const playerRes = request('GET', SERVER_URL + '/v1/player/1');
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(playerRes.statusCode).toStrictEqual(400);
  });
});

describe('Successful Case', () => {
  test('The player is in LOBBY state', () => {
    const playerRes = request('GET', SERVER_URL + '/v1/player/' + playerId);
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual(expect.objectContaining({
      state: 'LOBBY',
    }));
    expect(playerRes.statusCode).toStrictEqual(200);
  });
  test('The number of questions is accurate', () => {
    const playerRes = request('GET', SERVER_URL + '/v1/player/' + playerId);
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual(expect.objectContaining({
      numQuestions: expect.any(Number)
    }));
    expect(playerRes.statusCode).toStrictEqual(200);
  });
});
