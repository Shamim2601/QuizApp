import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

let user1 : {token: string};
beforeEach(() => {
  const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res1.body.toString());
});

describe('Error Cases', () => {
  test('Not a valid user', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: '-1', oldPassword: 'originalpassword7', newPassword: 'newpassword123' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Incorrect old password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'wrongpassword432', newPassword: 'newpassword123' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Same old password and new password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: 'originalpassword7' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('new password has been used before', () => {
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: 'changedpasswordonce78' } });
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'changedpasswordonce78', newPassword: 'originalpassword7' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(400);
  });

  test.each(['aaaaa', 'AAAAA', 'ABC123', 'Le+89!', 'morethantwentycharactersssssss', '1357908642', '>-<', '!@#$%^&*()', 'aBC745'])('Invalid password', (newpassword) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: newpassword } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe(' Successful Cases', () => {
  test('test return type of function', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: 'changedpasswordonce78' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('successfully updates one password once', () => {
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: 'changedpasswordonce78' } });
    const loginFail = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'leah123@gmail.com', password: 'originalpassword7' } });
    const loginSuccess = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'leah123@gmail.com', password: 'changedpasswordonce78' } });
    expect(JSON.parse(loginFail.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginFail.statusCode).toStrictEqual(400);
    expect(JSON.parse(loginSuccess.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(loginSuccess.statusCode).toStrictEqual(200);
  });

  test('successfully updates password multiple times for multiple users', () => {
    const res1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'siluni@gmail.com', password: 'inlisu194', nameFirst: 'Siluni', nameLast: 'Fernando' } });
    const user2 = JSON.parse(res1.body.toString());
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'originalpassword7', newPassword: 'changedpasswordonce78' } });
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user1.token, oldPassword: 'changedpasswordonce78', newPassword: 'newpassword792' } });
    let loginFail = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'leah123@gmail.com', password: 'originalpassword7' } });
    expect(JSON.parse(loginFail.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginFail.statusCode).toStrictEqual(400);
    loginFail = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'leah123@gmail.com', password: 'changedpasswordonce78' } });
    expect(JSON.parse(loginFail.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginFail.statusCode).toStrictEqual(400);
    let loginSuccess = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'leah123@gmail.com', password: 'newpassword792' } });
    expect(JSON.parse(loginSuccess.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(loginSuccess.statusCode).toStrictEqual(200);
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user2.token, oldPassword: 'inlisu194', newPassword: 'passwordnew123' } });
    request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token: user2.token, oldPassword: 'passwordnew123', newPassword: 'abcde6792' } });
    loginFail = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'siluni@gmail.com', password: 'inlisu194' } });
    expect(JSON.parse(loginFail.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginFail.statusCode).toStrictEqual(400);
    loginFail = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'siluni@gmail.com', password: 'passwordnew123' } });
    expect(JSON.parse(loginFail.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginFail.statusCode).toStrictEqual(400);
    loginSuccess = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'siluni@gmail.com', password: 'abcde6792' } });
    expect(JSON.parse(loginSuccess.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(loginSuccess.statusCode).toStrictEqual(200);
  });
});
