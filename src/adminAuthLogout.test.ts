import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let token:string;

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
  token = JSON.parse(res.body.toString()).token;
  console.log(token);
});

describe('Failed Logout', () => {
  test('Token Empty', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token: null } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Token does not exist', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token: "there'snowaythisisatokenright??????" } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Successful Logout + Side Effects', () => {
  test('Successful Return Type', () => {
    const res = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token: token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  // Only one side effect test since if the token is not in the sessions array it should work for all
  test('Side Effect', () => {
    let res = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token: token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
    res = request('GET', SERVER_URL + '/v1/admin/user/details', {
      headers: {
        token: token
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});
