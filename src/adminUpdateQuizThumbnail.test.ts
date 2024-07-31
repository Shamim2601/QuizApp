import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1: {token: string};
let quiz1: {quizId: number};
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res.body.toString());
  const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user1.token }, json: { name: 'first quiz', description: 'easy' } });
  quiz1 = JSON.parse(quizRes.body.toString());
});

describe('Error Cases', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/thumbnail`, { headers: { token: user1.token + 1 }, json: { imgUrl: 'http://google.com/some/image/path.jpg' } });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test("Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist", () => {
    let res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'ben@gmail.com', password: 'mypassword7', nameFirst: 'ben', nameLast: 'tom' } });
    const user2 = JSON.parse(res.body.toString());
    const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token: user2.token }, json: { name: "ben's quiz", description: 'ok' } });
    const quiz2 = JSON.parse(quizRes.body.toString());
    res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/thumbnail`, { headers: { token: user1.token }, json: { imgUrl: 'http://google.com/some/image/path.jpg' } });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test.each(['http://google.com/some/image/path', 'http://google.com/some/image/path.jjg', 'http://google.com/some/image/path.pngee'])('Invalid url end', (imgUrl) => {
    console.log(quiz1.quizId);
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/thumbnail`, { headers: { token: user1.token }, json: { imgUrl: imgUrl } });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each(['htp://google.com/some/image/path.jpg', 'google.com/some/image/path.jpeg', 'jpg.http://google.com/some/image/path.png'])('Invalid url starting', (imgUrl) => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/thumbnail`, { headers: { token: user1.token }, json: { imgUrl: imgUrl } });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful Cases', () => {
  test('succesfully adds thumbnail for one quiz', () => {
    request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/thumbnail`, { headers: { token: user1.token }, json: { imgUrl: 'http://google.com/some/image/path.jpg' } });
    const res = request('GET', SERVER_URL + `/v2/admin/quiz/${quiz1.quizId}`, {
      headers: {
        token: user1.token,
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    expect(JSON.parse(res.body.toString())).toEqual(expect.objectContaining({ thumbnailUrl: 'http://google.com/some/image/path.jpg' }));
  });
  test('succesful return type', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/thumbnail`, { headers: { token: user1.token }, json: { imgUrl: 'http://google.com/some/image/path.jpg' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
});
