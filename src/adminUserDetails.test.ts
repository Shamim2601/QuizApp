import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session:string;
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
  session = JSON.parse(res.body.toString()).token;
});

describe('Invalid inputs and error messages', () => {
  test('Invalid/Empty Input', () => {
    const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: null
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('User not found', () => {
    const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: 'sinceweareimplementingourstringstobehexadecimalsthereisabsolutelyNOWAYthiscouldbeatoken,right?'
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Found Users', () => {
  test('Found user', () => {
    const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Found user from multiple users', () => {
    const res2 = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'liveloveasap@gmail.com',
        password: 'lordprettyflackojodye2',
        nameFirst: 'ASAP',
        nameLast: 'ROCKY'
      }
    });
    session = JSON.parse(res2.body.toString()).token;
    request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'allmyheroesarecornballs@gmail.com',
        password: 'H4z4RDDUTYPAY!',
        nameFirst: 'JPEG',
        nameLast: 'MAFIA'
      }
    });
    const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'ASAP ROCKY',
        email: 'liveloveasap@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});

describe('Side Effects/Interactions with Other Functions', () => {
  test('Failed password Increment', () => {
    let res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);

    request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'scarymonstersandsupercreeps12',
      }
    });
    request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'lodger1979',
      }
    });

    res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 2
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Successful Login Increment', () => {
    let res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station2station',
      }
    });
    session = JSON.parse(res.body.toString()).token;

    res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Successful Login Resets Failed Passwords', () => {
    let res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);

    request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'scarymonstersandsupercreeps12',
      }
    });
    request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'lodger1979',
      }
    });

    res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 2
      }
    });
    expect(res.statusCode).toStrictEqual(200);

    res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
      json: {
        email: 'thinwhiteduke@gmail.com',
        password: 'station2station',
      }
    });
    session = JSON.parse(res.body.toString()).token;

    res = request('GET', SERVER_URL + '/v2/admin/user/details', {
      headers: {
        token: session
      }
    });

    expect(JSON.parse(res.body.toString())).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'David Bowie',
        email: 'thinwhiteduke@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});
/* import {clear} from "./other.js"
import {adminAuthLogin, adminAuthRegister, adminUserDetails} from "./auth.js"

describe('Invalid inputs and error messages', () => {
    let user1

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")
    });

    test('Invalid/Empty input', () => {
        expect(adminUserDetails(null)).toStrictEqual({
            error: expect.any(String)
        })
    })

    test('User not found', () => {
        expect(adminUserDetails(user1.authUserId+100000)).toStrictEqual({
            error: expect.any(String)
        })
    })
})

describe('Found users', () => {
    let user1

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")
    });

    test('Found user', () => {
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
    })

    test('Found user from multiple users', () => {
        adminAuthRegister("liveloveasap@gmail.com", "lordprettyflackojodye2", "ASAP", "Rocky")
        adminAuthRegister("allmyheroesarecornballs@gmail.com", "H4ZARDDUTYPAY!", "JPEG", "MAFIA")
        let user2 = adminAuthRegister("mrselfdestruct@gmail.com", "9inchnails", "Trent", "Reznor")
        expect(adminUserDetails(user2.authUserId)).toStrictEqual({
            user: {
                userId: user2.authUserId,
                name: "Trent Reznor",
                email: "mrselfdestruct@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
    })
})

describe('Interactions with other functions', () => {
    let user1

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister("thinwhiteduke@gmail.com", "station2station", "David", "Bowie")
    });

    test('Failed Passwords Increment', () => {
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
        adminAuthLogin("thinwhiteduke@gmail.com", "lodger1979")
        adminAuthLogin("thinwhiteduke@gmail.com", "scarymonstersandsuperfreaks12")
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 2
            }
        })
    })

    test('Successful Logins Increment', () => {
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
        adminAuthLogin("thinwhiteduke@gmail.com", "station2station")
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 2,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
    })

    test('Failed Passwords Increment and Reset', () => {
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
        adminAuthLogin("thinwhiteduke@gmail.com", "lodger1979")
        adminAuthLogin("thinwhiteduke@gmail.com", "scarymonstersandsuperfreaks12")
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 2
            }
        })
        adminAuthLogin("thinwhiteduke@gmail.com", "station2station")

        expect(adminUserDetails(user1.authUserId)).toStrictEqual({
            user: {
                userId: user1.authUserId,
                name: "David Bowie",
                email: "thinwhiteduke@gmail.com",
                numSuccessfulLogins: 2,
                numFailedPasswordsSinceLastLogin: 0
            }
        })
    })
}) */
