import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let user1: {token: string};
let quiz1: {quizId: number};
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'leah123@gmail.com', password: 'originalpassword7', nameFirst: 'Leah', nameLast: 'Emb' } });
  user1 = JSON.parse(res.body.toString());
  const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user1.token, name: 'first quiz', description: 'easy' } });
  quiz1 = JSON.parse(quizRes.body.toString());
});

describe('Error Cases', () => {
  test('Question string less than or greater than 50 characters', () => {
    let body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'Why?',
          duration: 4,
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
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);

    body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'Out of these countries Australia, New Zealand and Russia, which is the largest',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Russia',
              correct: true,
            },
            {
              answer: 'Australia',
              correct: true,
            },
            {
              answer: 'New Zealand',
              correct: false,
            }
          ]
        }
      }
    };
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('More than 6 answers or less than 2 answers', () => {
    let body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Canberra',
              correct: true,
            },
          ]
        }
      }
    };
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
    body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
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
            },
            {
              answer: 'Perth',
              correct: false,
            },
            {
              answer: 'Auckland',
              correct: true,
            },
            {
              answer: 'Adelaide',
              correct: false,
            },
            {
              answer: 'Hobart',
              correct: false,
            }
          ]
        }

      }
    };
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Question duration is not positive', () => {
    const body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: -1,
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
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Sum of question duration exceeds 3 minutes', () => {
    let body = {
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
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(res.statusCode).toStrictEqual(200);

    body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 61,
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
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Points is less than 1 or greater than 10 ', () => {
    let body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 12,
          points: 0,
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
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
    body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 6,
          points: 11,
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
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Answer length is less than 1 or greater than 30 ', () => {
    let body = {
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
              answer: 'Melbourneeeeeee Victoriaaaaaaaaaa',
              correct: false,
            }
          ]
        }
      }
    };
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
    body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 2,
          points: 2,
          answers: [
            {
              answer: '',
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
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Duplicate Answers', () => {
    const body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
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
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('No correct answer', () => {
    const body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Perth',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            }
          ]
        }
      }
    };
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('token is empty or invalid', () => {
    const body = {
      json: {
        token: '1',
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
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
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz not owned by user', () => {
    let res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'bernadette@gmail.com', password: 'mypassword7', nameFirst: 'Berny', nameLast: 'Roche' } });
    const user2 = JSON.parse(res.body.toString());
    const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: user2.token, name: 'a different quiz', description: 'okay' } });
    const quiz2 = JSON.parse(quizRes.body.toString());
    const body = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is the capitial city of Australia',
          duration: 4,
          points: 2,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
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
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2.quizId}/question`, body);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe(' Successful Cases', () => {
  test('Successfully adds question for user', () => {
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

    const body1 = {
      json: {
        token: user1.token,
        questionBody: {
          question: 'What is 1 + 1?',
          duration: 1,
          points: 4,
          answers: [
            {
              answer: '2',
              correct: true,
            },
            {
              answer: '4',
              correct: false,
            }
          ]
        }
      }
    };
    let res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body);
    const question1 = JSON.parse(res.body.toString());
    expect(JSON.parse(res.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    expect(res.statusCode).toStrictEqual(200);
    res = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}/question`, body1);
    const question2 = JSON.parse(res.body.toString());
    res = request('GET', SERVER_URL + `/v1/admin/quiz/${quiz1.quizId}`, { qs: { token: user1.token } });

    expect(JSON.parse(res.body.toString())).toEqual({
      quizId: quiz1.quizId,
      name: 'first quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'easy',
      numQuestions: 2,
      questions: [
        {
          questionId: question1.questionId,
          question: 'What is the capitial city of Australia',
          duration: 120,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Sydney',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Canberra',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Melbourne',
              colour: expect.any(String),
              correct: false
            },

          ]
        },
        {
          questionId: question2.questionId,
          question: 'What is 1 + 1?',
          duration: 1,
          points: 4,
          answers: [
            {
              answerId: expect.any(Number),
              answer: '2',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: '4',
              colour: expect.any(String),
              correct: false
            }
          ]
        }

      ],
      duration: 121

    });
  });
});
