import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'thinwhiteduke@gmail.com',
      password: 'station2station',
      nameFirst: 'David',
      nameLast: 'Bowie'
    }
  });
});

// As per the week 5 lab's feedback session, I'll be limiting the amount of redundant tests
describe('Failed Logins', () => {
  test('Email does not exist', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'ziggystardust@gmail.com',
        password: 'station2station',
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Incorrect Password', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station3station',
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful Logins', () => {
  test('One User', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station2station',
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Multiple Users', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'uchunipponsetagaya@gmail.com',
        password: 'longseason1996',
        nameFirst: 'Shinji',
        nameLast: 'Sato'
      }
    });
    request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'sheldonjplankton@gmail.com',
        password: 'chumbucket33',
        nameFirst: 'Sheldon',
        nameLast: 'Plankton'
      }
    });
    request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'inspectorseb@gmail.com',
        password: '4xveltmeister',
        nameFirst: 'Sebastian',
        nameLast: 'Vettel'
      }
    });
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'sheldonjplankton@gmail.com',
        password: 'chumbucket33'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});

// DEPRECATED ITER 1 TESTS
/*

import {clear} from "./other.js"
//import {adminAuthLogin, adminAuthRegister} from "./auth.js"

beforeEach.skip(() => {
    clear();
    //adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")
})

describe.skip('Failed Logins', () => {
    test('Email does not exist', () => {
        request('POST', SERVER_URL + '/v1/admin/auth/login', { timeout: TIMEOUT_MS });
        expect(adminAuthLogin("ziggystardust@gmail.com", "station2station")).toStrictEqual({
            error: expect.any(String)
        })
    })

    test('Incorrect Password', () => {
        expect(adminAuthLogin("thinwhiteduke@gmail.com", "5years123")).toStrictEqual({
            error: expect.any(String)
        })
    })

    test('Incorrect Password 2', () => {
        expect(adminAuthLogin("thinwhiteduke@gmail.com", "password")).toStrictEqual({
            error: expect.any(String)
        })
    })

    test('Incorrect Password 3', () => {
        expect(adminAuthLogin("thinwhiteduke@gmail.com", "123123123")).toStrictEqual({
            error: expect.any(String)
        })
    })
})

describe.skip('Successful Logins', () => {
    test('One User', () => {
        expect(adminAuthLogin("thinwhiteduke@gmail.com", "station2station")).toStrictEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }))
    })

    test('Multiple Users', () => {
        adminAuthRegister("uchunipponsetagaya@gmail.com", "longseason1996", "Shinji", "Sato")
        adminAuthRegister("sheldonjplankton@gmail.com", "chumbucket33", "Sheldon", "Plankton")
        adminAuthRegister("michaeljordan@gmail.com", "b3lik3mik3", "Michael", "Jordan")
        expect(adminAuthLogin("sheldonjplankton@gmail.com", "chumbucket33")).toStrictEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }))
    })

    test('Multiple Users with Login Fail', () => {
        adminAuthRegister("uchunipponsetagaya@gmail.com", "longseason1996", "Shinji", "Sato")
        adminAuthRegister("sheldonjplankton@gmail.com", "chumbucket33", "Sheldon", "Plankton")
        adminAuthRegister("michaeljordan@gmail.com", "b3lik3mik3", "Michael", "Jordan")
        expect(adminAuthLogin("sheldonjplankton@gmail.com", "chumbucket43")).toStrictEqual({
            error: expect.any(String)
        })
        expect(adminAuthLogin("sheldonjplankton@gmail.com", "chumbucket33")).toStrictEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }))
    })
})
*/
