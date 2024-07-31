import request from 'sync-request-curl';
import { port, url } from './config.json';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';
import { QuestionObject, QuizObject } from './dataStore';
// import { adminQuizInfo } from './quiz';
// import { getUserFromToken } from './auth';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;
let session: string;
let quiz: QuizObject;
let question: QuestionObject;

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

  const quizRes = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: {
      token: session
    },
    json: {
      name: 'Math test',
      description: 'Tests math skills'
    }
  });

  const answer = {
    answerId: 1234,
    answer: 'abcd',
    colour: 'red',
    correct: true
  };

  quiz = JSON.parse(quizRes.body.toString());
  question = {
    questionId: 1234,
    question: 'abcdef',
    duration: 12,
    points: 12,
    answers: [answer],
    thumbnailUrl: 'http://google.com/some/image/path.jpg'
  };
  quiz.questions = [];
  quiz.questions.push(question);
});

describe('Failed question removal', () => {
  test('Not a valid token', () => {
    const res = request('DELETE', SERVER_URL + '/v2/admin/quiz/' + quiz.quizId + '/question/' + question.questionId, {
      headers: {
        token: 'abcd',
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
  test('Not a valid quizId', () => {
    const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quiz.quizId + 1}/question/${question.questionId}`, {
      headers: {
        token: session,
      }
    });
    console.log(res.body.toString());
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
  test('Not a valid questionId', () => {
    const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quiz.quizId}/question/${question.questionId + 1}`, {
      headers: {
        token: session,
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Successful removal', () => {
  test('A valid quiz', () => {
    /* const res = */ request('DELETE', SERVER_URL + `/v2/admin/quiz/${quiz.quizId}/question/${question.questionId}`, {
      headers: {
        token: session,
      }
    });
    // expect(res.statusCode).toStrictEqual(200);
    // const quiz1 = JSON.parse(res.body.toString());
    // expect(JSON.parse(res.body.toString())).toEqual({});
  });
});
