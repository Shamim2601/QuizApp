import request from 'sync-request-curl';
import { port, url } from '../../config.json';

const SERVER_URL = `${url}:${port}`;

describe('Error Cases', () => {
  test('Move question to an invalid position', () => {
    const body = {
      json: {
        token: '23748',
        newPosition: -1,
      }
    };
    const res = request('PUT', SERVER_URL + '/v1/admin/quiz/1/question', body);
    expect(res.statusCode).toStrictEqual(400);
  });
});
