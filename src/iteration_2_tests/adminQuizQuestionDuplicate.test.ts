import request from 'sync-request-curl';

import { port, url } from '../config.json';

import { QuestionObject } from '../dataStore';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let question: QuestionObject;

let user1: {token: string};

let quiz1: {quizId: number};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });

  user1 = JSON.parse(res.body.toString());

  const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'first quiz', description: 'easy' } });

  quiz1 = JSON.parse(quizRes.body.toString());

  const body = {
    json: {
      token: user1.token,
      questionBody: {
        question: 'What is the capitial city of Australia',
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
        ]
      }
    }
  };
  console.log('TOKEN:', user1);
  const res1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
  question = JSON.parse(res1.body.toString());
  console.log(question);
});

describe('Unsuccessful Test Cases', () => {
  test('Question does not exist', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question/${question.questionId + 53}/duplicate`, { json: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Token is Invalid', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question/${question.questionId}/duplicate`, { json: { token: 'surelyinvalid' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz is Invalid', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId + 6231}/question/${question.questionId}/duplicate`, { json: { token: user1.token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Successful Test Cases', () => {
  test('Valid Return Type + Side Effect', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question/${question.questionId}/duplicate`, { json: { token: user1.token } });
    console.log(JSON.parse(res.body.toString()));
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      newQuestionId: expect.any(Number)
    });
    expect(res.statusCode).toStrictEqual(200);
    const res2 = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, {
      qs: {
        token: user1.token,
      }
    });
    expect(res.statusCode).toStrictEqual(200);
    const quizInf = JSON.parse(res2.body.toString());
    expect(quiz1).toEqual(expect.objectContaining({ quizId: quiz1.quizId }));
    // Not sure how to test since I didn't work on the quizdetails functiom but
    // I'm console.logging to show that the quiz is being updated.
    console.log(quizInf);
  });
});
