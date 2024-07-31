import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1: {token:string};
let user2: {token:string};
let user3 : {token:string};
beforeEach(() => {
  const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'leah123@gmail.com',
      password: 'asdfgh123',
      nameFirst: 'Leah',
      nameLast: 'Emb'
    }
  });
  const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'bernadette123@gmail.com',
      password: 'asdfgh123',
      nameFirst: 'Bernadatte',
      nameLast: 'Roche'
    }
  });
  const res3 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'siluni@gmail.com',
      password: 'inlisu194',
      nameFirst: 'Siluni',
      nameLast: 'Fernando'
    }
  });

  user1 = JSON.parse(res1.body.toString());
  user2 = JSON.parse(res2.body.toString());
  user3 = JSON.parse(res3.body.toString());
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: '-1',
        email: 'abcd1234@gmail.com',
        nameFirst: 'Bernadette',
        nameLast: 'Roche'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Email is already taken', () => {
    let res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: user1.token,
        email: 'bernadette123@gmail.com',
        nameFirst: 'Bernadette',
        nameLast: 'Roche'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
    res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
      json: {
        token: user2.token,
        email: 'leah123@gmail.com',
        nameFirst: 'Maria',
        nameLast: 'Mathew'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each(['notanemail', 'www.google.com', '!*!7(226@.com', '@gmail.com'])('Invalid Email', (email) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: email, nameFirst: 'Bernadette', nameLast: 'Roche' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test.each(['!!!!!', 'a', '123456', 'Le+H78', 'morethantwentycharactersssssss', 'H', '>-<'])('Invalid Namefirst', (namefirst) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'maria4254@gmail.com', nameFirst: namefirst, nameLast: 'Roche' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test.each(['!!!!!', 'a', '123456', 'Le+H78', 'morethantwentycharactersssssss', 'H', '>-<'])('Invalid nameLast', (namelast) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'maria4254@gmail.com', nameFirst: 'Maria', nameLast: namelast } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe(' Successful Cases', () => {
  test('test return type of function', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'sheldon.cooper@gmail.com', nameFirst: 'Sheldon', nameLast: 'Cooper' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ });
  });

  test('successfully updates one user', () => {
    request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'sheldon.cooper@gmail.com', nameFirst: 'Leah', nameLast: 'Cooper' } });
    const userdetails = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: user1.token } });
    expect(JSON.parse(userdetails.body.toString())).toStrictEqual({
      user:
              {
                userId: expect.any(Number),
                name: 'Leah Cooper',
                email: 'sheldon.cooper@gmail.com',
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
              }
    });
  });
});

test('successfully updates multiple user', () => {
  request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'abcd@gmail.com', nameFirst: 'Sheldon', nameLast: 'Cooper' } });
  request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user1.token, email: 'abcd@gmail.com', nameFirst: 'Cooper', nameLast: 'Sheldon' } });
  request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user2.token, email: 'anjie.em@gmail.com', nameFirst: 'Anjie', nameLast: 'Mathews' } });
  request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token: user3.token, email: 'amanda.per@gmail.com', nameFirst: 'Amanda', nameLast: 'Pereira' } });
  let userdetails = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: user1.token } });
  expect(JSON.parse(userdetails.body.toString())).toStrictEqual({
    user:
              {
                userId: expect.any(Number),
                name: 'Cooper Sheldon',
                email: 'abcd@gmail.com',
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
              }
  });
  userdetails = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: user2.token } });
  expect(JSON.parse(userdetails.body.toString())).toStrictEqual({
    user:
        {
          userId: expect.any(Number),
          name: 'Anjie Mathews',
          email: 'anjie.em@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
  });
  userdetails = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token: user3.token } });
  expect(JSON.parse(userdetails.body.toString())).toStrictEqual({
    user:
        {
          userId: expect.any(Number),
          name: 'Amanda Pereira',
          email: 'amanda.per@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
  });
});
