import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Register Failed', () => {
  test('Email already taken', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'Thom',
        nameLast: 'Yorke'
      }
    });
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'Thom',
        nameLast: 'Yorke'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid email input', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'thisaintnoemail',
        password: 'validpassword123',
        nameFirst: 'David',
        nameLast: 'Byrne'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid first name input: numbers', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: '50',
        nameLast: 'Cent'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid first name input: symbols', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'Woah!',
        nameLast: 'Cent'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid first name input: too short', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'a',
        nameLast: 'Cent'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid first name input: too long', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'myfirstnameisverylongheydidimentionmyfirstnameisverylongsosolong',
        nameLast: 'Cent'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid last name input: numbers', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'Andre',
        nameLast: '3000'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid last name input: symbols', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'WhoIs',
        nameLast: 'ThisGuy?'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid last name input: too short', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'WhoIs',
        nameLast: 'T'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid last name input: too long', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'validpassword123',
        nameFirst: 'WhoIs',
        nameLast: 'thisisaverylonglastnamepaperworkmustbeexhausting'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid password: length', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'short',
        nameFirst: 'Hanni',
        nameLast: 'Pham'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid password: all numbers', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: '7173212464',
        nameFirst: 'Hanni',
        nameLast: 'Pham'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Invalid password: no numbers', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'coolemail@gmail.com',
        password: 'mmm...food',
        nameFirst: 'MF',
        nameLast: 'Doom'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Register Successful', () => {
  test('Successful singular register', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station2station',
        nameFirst: 'David',
        nameLast: 'Bowie'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Multiple users registered', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station2station',
        nameFirst: 'David',
        nameLast: 'Bowie'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);

    // Two users added here quickly test if the program plays well with ' and - characters
    const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ineedafriend@gmail.com',
        password: 'passw0rdhaha',
        nameFirst: 'Conan',
        nameLast: "O'Brien"
      }
    });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(200);

    const res3 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'ilikechess@gmail.com',
        password: 'pr1nc355p34ch',
        nameFirst: 'Anya',
        nameLast: 'Taylor-Joy'
      }
    });
    expect(JSON.parse(res3.body.toString())).toStrictEqual({ token: expect.any(String) });
    expect(res3.statusCode).toStrictEqual(200);
  });
});
// ITERATION 1 TESTS DEPRECATED

/* import {clear} from "./other.js"
import {adminAuthRegister} from "./auth.js"

beforeEach(() => {
    clear();
});

describe('Register Failed', () => {
    test('Email already taken', () => {
        adminAuthRegister("coolemail@gmail.com", "validpassword123", "Thom", "Yorke")
        expect(adminAuthRegister("coolemail@gmail.com", "emailtaken101", "Joni", "Mitchell")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid email input', () => {
        expect(adminAuthRegister("thisaintnoemail", "password123", "David", "Byrne")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid first name input: numbers', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "50", "Cent")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid first name input: symbols', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "Woah!", "Lastname")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid first name input: too short', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "a", "Lastname")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid first name input: too long', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "myfirstnameisverylongheydidimentionmyfirstnameisverylong", "Lastname")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid last name input: numbers', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "Andre", "3000")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid last name input: symbols', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "WhoIs", "ThisGuy?")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid last name input: too short', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "ShortLastName", "o")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid last name input: too long', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "password123", "LongLastName", "thisisaverylonglastnamepaperworkmustbeexhausting")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid password input: length', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "short", "Hanni", "Pham")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid password input: all numbers', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "555555555", "Wu-tang", "Clan")).toStrictEqual({
            error: expect.any(String)
        });
    })

    test('Invalid password input: all letters', () => {
        expect(adminAuthRegister("coolemail@gmail.com", "mmm...food", "MF", "Doom")).toStrictEqual({
            error: expect.any(String)
        });
    })
});

describe('Register Successful', () => {
    test('Successful singular register', () => {
        expect(adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
    })

    test('Multiple users registered', () => {
        expect(adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
        expect(adminAuthRegister("ineedafriend@gmail.com", "passw0rdhaha", "Conan", "O'Brien")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
        expect(adminAuthRegister("ilikechess@gmail.com", "pr1nc355p35ch", "Anya", "Taylor-Joy")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
    })

    test('Multiple users registered + Invalid Input', () => {
        expect(adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
        expect(adminAuthRegister("ilikethisemail@gmail.com", "ihatedrake123", "Kendrick", "Lamar")).toEqual(expect.objectContaining({
            authUserId: expect.any(Number)
        }));
        expect(adminAuthRegister("ilikethisemail@gmail.com", "cur1ousloverboy", "Aubrey", "Drake-Graham")).toEqual({
            error: expect.any(String)
        });

    })
}) */
