import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let quiz1: {quizId: number};
// let question: {questionId: number};
let gameSession: { sessionId: number };

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
});

describe('Error Cases', () => {
  test('Invalid Session', () => {
    const playerRes = request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: 1, name: 'Wamia' } });
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(playerRes.statusCode).toStrictEqual(400);
  });
  test('Session is not in LOBBY state', () => {
    request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/session/${gameSession.sessionId}`, { headers: { token: user1.token }, json: { action: 'NEXT_QUESTION' } });
    const playerRes = request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: gameSession.sessionId, name: 'Wamia' } });
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(playerRes.statusCode).toStrictEqual(400);
  });
  test('The name is not unique', () => {
    request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: gameSession.sessionId, name: 'Wamia' } });
    const playerRes2 = request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: gameSession.sessionId, name: 'Wamia' } });
    expect(JSON.parse(playerRes2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(playerRes2.statusCode).toStrictEqual(400);
  });
});

describe('Successful Case', () => {
  test('The player joined successfully', () => {
    const playerRes = request('POST', SERVER_URL + '/v1/player/join', { json: { sessionId: gameSession.sessionId, name: 'Wamia' } });
    expect(JSON.parse(playerRes.body.toString())).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerRes.statusCode).toStrictEqual(200);
  });
  // test('The name is successfully randomly generated', () => {
  //   const playerRes = request('POST', SERVER_URL + '/v1/player/join', { json: {sessionId: gameSession.sessionId, name: ''}})
  //   const player = JSON.parse(playerRes.body.toString());
  //   expect(JSON.parse(playerRes.body.toString())).toStrictEqual({ playerId: expect.any(Number) });
  //   expect(getPlayerFromPlayerId(player.playerId)).toStrictEqual(expect.objectContaining({ name: expect.any(String)}));
  //   expect(playerRes.statusCode).toStrictEqual(200);
  // })
});
