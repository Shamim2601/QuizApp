import { ErrorObject, QuizObject, setData, getData, SessionObject, Action, State, PlayerObject } from './dataStore';
import {} from './quizv2';
import { checkPlayerExistence, getSessionFromId, getSessionFromPlayerId } from './util';

export function createSession(quizId: number, authUserId: number, autoStartNum: number): ErrorObject| {sessionId: number} {
  const data = getData();
  // 401 errors - done in server
  // 403 errors - done in server
  // const user = findUserDetails(authUserId);
  // 400 errors
  const quiz = findUsersQuiz(authUserId, quizId);

  if (quiz.questions.length === 0) {
    throw new Error('The quiz does not have any questions in it');
  }
  if (autoStartNum > 50) {
    throw new Error('autoStartNum is a number greater than 50');
  }
  // check if session already exists for
  if (!(quizId in data.sessions)) {
    data.sessions[quizId] = [];
  } else {
    const notInEnd = sessionsNotInEndState(data.sessions[quizId]);
    if (notInEnd >= 10) {
      throw new Error('10 sessions that are not in END state currently exist for this quiz');
    }
  }
  // Implementation
  const newSession:SessionObject = {
    sessionId: data.sessions[quizId].length,
    state: State.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: quiz,
    autoStartNum: autoStartNum,
    results: {
      usersRankedByScore: [],
      questionResults: []
    }
  };

  console.log(newSession);

  data.sessions[quizId].push(newSession);
  setData(data);
  return { sessionId: newSession.sessionId };
}

export function quizInTrash(trash: QuizObject[], quizId: number) {
  const trashIds = trash.map(quiz => quiz.quizId);
  if (trashIds.includes(quizId)) {
    throw new Error('The quiz is in trash');
  }
}

function findUsersQuiz(authUserId: number, quizId: number) {
  const data = getData();
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  return quiz;
}

export function sessionsNotInEndState(sessions : SessionObject[]) {
  const sessionStates = sessions.map(session => session.state);
  let count = 0;
  for (const sessionState of sessionStates) {
    if (sessionState !== State.END) {
      count++;
    }
  }
  return count;
}

export function updateState(sessionId:number, action:string, quizId:number) {
  const data = getData();
  const actionValidity = checkValidAction(action);
  if (actionValidity && actionValidity.error) {
    throw new Error(actionValidity.error);
  }

  const sessionArray = data.sessions[quizId];
  const session = sessionArray.find(s => s.sessionId === sessionId);

  if (session) {
    if (action === 'END') {
      session.state = State.END;
    }
    if (action === 'NEXT_QUESTION') {
      if (session.state === State.ANSWER_SHOW || session.state === State.LOBBY || session.state === State.QUESTION_CLOSE) {
        session.state = State.QUESTION_COUNTDOWN;
      } else {
        throw new Error('Invalid action for state!');
      }
    }
    if (action === 'SKIP_COUNTDOWN') {
      if (session.state === State.QUESTION_COUNTDOWN) {
        session.state = State.QUESTION_OPEN;
      } else {
        throw new Error('Invalid action for state!');
      }
    }
    if (action === 'GO_TO_ANSWER') {
      if (session.state === State.QUESTION_CLOSE || session.state === State.QUESTION_OPEN) {
        session.state = State.ANSWER_SHOW;
      } else {
        throw new Error('Invalid action for state!');
      }
    }
    if (action === 'GO_TO_FINAL_RESULTS') {
      if (session.state === State.QUESTION_CLOSE || session.state === State.ANSWER_SHOW) {
        session.state = State.FINAL_RESULTS;
      } else {
        throw new Error('Invalid action for state!');
      }
    }
  } else {
    throw new Error('Session not found!');
  }
  setData(data);
  return {};
}

function checkValidAction(action:string) {
  if (!Object.values(Action).includes(action as Action)) {
    return { error: 'Not a valid action!' };
  }
  return {};
}

/* function getSessionByQuiz(sessionId:number, quizId:number) {
  const data = getData();
  for (const session of data.sessions[quizId]) {
    if (session.sessionId === sessionId) {
      return session;
    }
  }
  return {error: "Session does not exist for this quiz!"}
}
*/

export function getSessionStatus(quizId:number, sessionId:number) {
  const data = getData();
  const sessionArray = data.sessions[quizId];
  console.log(sessionArray);
  const session = sessionArray.find(s => s.sessionId === sessionId);

  if (session) {
    return {
      state: session.state,
      atQuestion: session.atQuestion,
      players: session.players,
      metadata: session.metadata
    };
  } else {
    throw new Error('Session not found!');
  }
}

export function joinPlayer(sessionId: number, name: string) {
  const session = getSessionFromId(sessionId);
  if (!session) {
    throw new Error('Session not found!');
  }
  if (session.state !== State.LOBBY) {
    throw new Error('Session is not in LOBBY state!');
  }
  if (name === '') {
    name = generateName();
  }
  if (checkPlayerExistence(name, sessionId)) {
    throw new Error('This player already exists!');
  }

  const data = getData();
  const iD = session.players.length;
  console.log(iD);

  const newPlayer:PlayerObject = {
    playerId: iD,
    name: name,
    score: 0,
    session: session.sessionId
  };
  const sessionIndex = data.sessions[session.metadata.quizId].findIndex((sessionObject) => {
    return sessionObject.sessionId === session.sessionId;
  });
  data.sessions[session.metadata.quizId][sessionIndex].players.push(newPlayer);
  setData(data);
  console.log(iD);
  return { playerId: iD };
}

function generateName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';

  function getRandomCharacters(source: string, count: number): string {
    let result = '';
    const sourceArray = source.split('');
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * sourceArray.length);
      result += sourceArray[randomIndex];
      sourceArray.splice(randomIndex, 1); // remove the used character to avoid repetition
    }
    return result;
  }

  const randomLetters = getRandomCharacters(letters, 5);
  const randomNumbers = getRandomCharacters(digits, 3);

  return randomLetters + randomNumbers;
}

export function getPlayerSession(playerId:number) {
  const session = getSessionFromPlayerId(playerId);
  if (!session) {
    throw new Error();
  }
  return {
    state: session.state,
    numQuestions: session.metadata.numQuestions,
    atQuestion: session.atQuestion
  };
}

export function viewActiveAndInactiveSessions(authUserId: number, quizId: number) {
  // if token is valid and quiz belongs to user
  // function implementation
  const activeSessions = [];
  const inactiveSessions = [];
  const data = getData();
  console.log(data);
  if (quizId in data.sessions) {
    for (const session of data.sessions[quizId]) {
      if (session.state === State.END) {
        inactiveSessions.push(session.sessionId);
      } else {
        activeSessions.push(session.sessionId);
      }
    }
  }

  return { activeSessions, inactiveSessions };
}

export function getResultsForSession (quizId:number, sessionId:number) {
  const data = getData();
  const sessionArray = data.sessions[quizId];
  console.log(sessionArray);
  const session = sessionArray.find(s => s.sessionId === sessionId);
  if (session) {
    return session.results;
  } else {
    throw new Error('Session not found!');
  }
}
