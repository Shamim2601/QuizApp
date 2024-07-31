/* import { getUserFromToken } from './auth';
import { UserObject, ErrorObject, QuizObject, setData, getData, DataObject, EmptyObject, ErrorObjectStatus, QuestionObject, QuestionBodyObject } from './dataStore';
// Stub for the adminQuizList function
// Returns a list of all quizzes owned by the current user

let totalQuizCount = 0;

export function adminQuizList(authUserId: number): ErrorObject|{quizzes: {
    quizId: number;
    name: string;
}[]} {
  const data = getData();
  // search to see if authUserId is valid
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid user Id' };
  }
  // creates list of quizzes owned by user
  const list = [];
  for (const i in data.quizzes[authUserId]) {
    list.push({ quizId: data.quizzes[authUserId][i].quizId, name: data.quizzes[authUserId][i].name });
  }
  return {
    quizzes: list,
  };
}

// Stub for the adminQuizCreate function
// Returns an object containing the new quizId

export function adminQuizCreate(authUserId: number, name: string, description: string): ErrorObjectStatus|{quizId: number} {
  const userValidity = validateUserId(authUserId);
  const quizNameValidity = validateQuizName(name, authUserId);
  const descriptionValidity = validateDescription(description);

  if (userValidity && userValidity.error) {
    return userValidity;
  }
  if (quizNameValidity && quizNameValidity.error) {
    return quizNameValidity;
  }
  if (descriptionValidity && descriptionValidity.error) {
    return descriptionValidity;
  }
  const quizzes = getData().quizzes;
  if (!quizzes[authUserId]) {
    quizzes[authUserId] = [];
  }

  const id = getQuizId();

  quizzes[authUserId].push({
    quizId: id,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: null,
    description: description,
    questions: [],
    numQuestions: 0,
    duration: 0
  });

  return { quizId: id };
}

// Stub for the adminQuizRemove function
// Returns an empty object
export function adminQuizRemove(authUserId: number, quizId: number): ErrorObjectStatus|EmptyObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);

  if (userValidity && userValidity.error) {
    return userValidity;
  }

  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }

  // MOCK DELETE, PLEASE CHECK TO SEE IF THIS ACTUALLY DELETES SINCE I PRIORITIZED PUSHING TO USER.TRASH(should work tho imo)
  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.findIndex(a => a.quizId === quizId);
  const user = getUserFromId(authUserId);
  // We don't really need this line since we've already validated that a user exists but since typescript is being pedantic this exists
  console.log(quiz);
  if ('trash' in user) {
    if (quiz !== -1) {
      user.trash.push(quizzes[quiz]);
      quizzes.splice(quiz, 1);
    }
  }

  // quizzes.splice(quizzes.findIndex(a => a.quizId === quizId), 1);
  setData(data);
  return { };
}

// Stub for the adminQuizInfo function
// Returns an object containing the quiz information

export function adminQuizInfo(authUserId: number, quizId: number): ErrorObjectStatus|QuizObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);

  if (userValidity && userValidity.error) {
    return userValidity;
  }
  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(q => q.quizId === quizId);

  return quiz;
}

// Stub for the adminQuizNameUpdate function
// Returns an empty object

export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): ErrorObjectStatus|EmptyObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);
  const quizNameValidity = validateQuizName(name, authUserId);

  if (userValidity && userValidity.error) {
    return userValidity;
  }
  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }
  if (quizNameValidity && quizNameValidity.error) {
    return quizNameValidity;
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(q => q.quizId === quizId);

  if (quiz) {
    quiz.name = name;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  }

  return {};
}

// Stub for the adminQuizDescriptionUpdate function
// Returns an empty object

export function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): ErrorObjectStatus|EmptyObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);
  const descriptionValidity = validateDescription(description);

  if (userValidity && userValidity.error) {
    return userValidity;
  }
  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }
  if (descriptionValidity && descriptionValidity.error) {
    return descriptionValidity;
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(q => q.quizId === quizId);

  if (quiz) {
    quiz.description = description;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  }

  return {};
}
// Since we're passing authUserId from inside the server/route thing,
// I'm assuming token is validated there(following previous quiz functionalities).
export function adminQuizTrash(token: string) {
  const user = getUserFromToken(token);
  const trashedQuizzes = [];
  if (user === null) {
    return { error: 'Invalid Token!' };
  } else {
    for (const quiz of user.trash) {
      trashedQuizzes.push({
        quizId: quiz.quizId,
        name: quiz.name
      });
    }
    return { quizzes: trashedQuizzes };
  }
}
// HELPER FUNCTIONS
function validateUserId(authUserId: number): ErrorObjectStatus|null {
  const users = getData().users;
  const uIndex = users.findIndex(user => user.authUserId === authUserId);

  if (uIndex === -1) {
    return { error: 'User is not a valid user', statusCode: 401 };
  }
}

function validateQuizName(name: string, authUserId: number): ErrorObjectStatus|null {
  if (name.length < 3) {
    return { error: 'Invalid quiz name input! Quiz name should be greater than two characters.', statusCode: 400 };
  }
  if (name.length > 30) {
    return { error: 'Invalid quiz name input! Quiz name should be less than thirty characters.', statusCode: 400 };
  }

  const valid = /^[a-zA-Z\s0-9]{3,30}$/;
  if (!valid.test(name)) {
    return { error: 'Invalid quiz name input! Quiz name should not contain any symbols.', statusCode: 400 };
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];

  if (!quizzes) {
    return;
  }

  const index = quizzes.findIndex(quiz => quiz.name === name);

  if (index !== -1) {
    return { error: 'Quiz name is already used by the current logged in user for another quiz.', statusCode: 400 };
  }
}

function validateDescription(description: string): ErrorObjectStatus|null {
  if (description.length > 100) {
    return { error: 'Invalid description! Description should be less than a hundred characters.', statusCode: 400 };
  }
}

function getQuizId(): number {
  totalQuizCount = totalQuizCount + 1;
  return totalQuizCount;
}

function validateQuizId(quizId: number, authUserId: number): ErrorObjectStatus|null {
  if (quizId < 0 || quizId > totalQuizCount) {
    return { error: 'Invalid Quiz Id!', statusCode: 403 };
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];

  if (!quizzes) {
    return { error: 'This quiz does not belong to the logged in user', statusCode: 403 };
  }

  const index = quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (index === -1) {
    return { error: 'This quiz does not belong to the logged in user', statusCode: 403 };
  }
}

// Assumes valid user. Helper function for trash functionalities.
function getUserFromId(userId:number):UserObject|EmptyObject {
  const data = getData();
  for (const user of data.users) {
    if (user.authUserId === userId) {
      return user;
    }
  }

  return {};
}

export function quizTransfer(quizId: number, authUserId: number, userEmail: string) {
  const data = getData();
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid user Id' };
  }
  const userWithEmail = data.users.find(current => current.email === userEmail);
  if (userWithEmail === undefined) {
    return { error: 'User email is not a real user', statusCode: 400 };
  }

  if (userEmail === user.email) {
    return { error: 'Provided User email is currently loggined', statusCode: 400 };
  }
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  if (quiz === undefined) {
    return { error: 'user is not the owner of this quiz', statusCode: 403 };
  }

  if (userWithEmail.authUserId in data.quizzes) {
    const quizWithSameName = data.quizzes[userWithEmail.authUserId].find(current => current.name === quiz.name);
    if (quizWithSameName !== undefined) {
      return { error: 'Quiz name is already used by this user', statusCode: 400 };
    }
  }
  if (!(userWithEmail.authUserId in data.quizzes)) {
    data.quizzes[userWithEmail.authUserId] = [];
  }

  data.quizzes[userWithEmail.authUserId].push(quiz);
  data.quizzes[authUserId].splice(data.quizzes[authUserId].findIndex(a => a.quizId === quizId), 1);
  setData(data);
  return {};
}

export function quizQuestionCreate(quizId:number, authUserId: number, questionBody :QuestionObject) {
  const data = getData();
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid user Id', statusCode: 401 };
  }
  // 403 error

  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  if (quiz === undefined) {
    return { error: 'user is not the owner of this quiz', statusCode: 403 };
  }

  // 400 errors

  if (questionBody.question.length > 50 || questionBody.question.length < 5) {
    return { error: 'Question is less than 5 characters or greater than 50 characters', statusCode: 400 };
  }
  if (questionBody.answers.length > 6 || questionBody.answers.length < 2) {
    return { error: 'The question has more than 6 or less than 2 answers', statusCode: 400 };
  }
  if (questionBody.duration < 0) {
    return { error: 'The question duration is not a positive number', statusCode: 400 };
  }

  if (quiz.duration + questionBody.duration > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes', statusCode: 400 };
  }

  if (questionBody.points > 10 || questionBody.points < 1) {
    return { error: 'The points awarded for the question are less than 1 or greater than 10', statusCode: 400 };
  }

  if (!validAnswerlengths(questionBody)) {
    return { error: 'Answer is shorter than 1 character, or longer than 30 characters', statusCode: 400 };
  }

  if (checkDuplicateAnswers(questionBody)) {
    return { error: 'Any answer strings are duplicates of one another (within the same question)', statusCode: 400 };
  }
  if (!checkCorrectAnswers(questionBody)) {
    return { error: 'There are no correct answers', statusCode: 400 };
  }

  const colours = ['red', 'orange', 'blue', 'yellow', 'green', 'pink'];
  quiz.duration = quiz.duration + questionBody.duration;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.numQuestions = quiz.numQuestions + 1;

  const quizQuestion = {
    questionId: quiz.questions.length,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers.map((ans, index) => {
      return {
        answerId: index + 1,
        answer: ans.answer,
        colour: colours[Math.floor(Math.random() * colours.length)],
        correct: ans.correct,
      };
    }),
    thumbnailUrl: questionBody.thumbnailUrl
  };

  quiz.questions.push(quizQuestion);
  setData(data);
  return { questionId: quizQuestion.questionId };
}

export function adminQuizRestore(authUserId:number, quizId:number):EmptyObject|ErrorObjectStatus {
  const data = getData();
  const quiz = checkQuizValidRestore(data, quizId, authUserId);

  if ('error' in quiz) {
    return { error: quiz.error, statusCode: quiz.statusCode };
  }
  data.quizzes[authUserId].push(quiz);
  return {};
}

function checkQuizValidRestore(data:DataObject, quizId:number, authUserId:number):QuizObject|ErrorObjectStatus {
  let quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  const user = data.users.find(current => current.authUserId === authUserId);

  if (quiz !== undefined) {
    console.log('THISONE');
    return { error: 'Quiz not in restore!', statusCode: 400 };
  }
  quiz = user.trash.find(current => current.quizId === quizId);
  if (quiz === undefined) {
    return { error: 'Quiz does not exist!', statusCode: 403 };
  }
  for (const quizName of data.quizzes[authUserId]) {
    if (quizName.name === quiz.name) {
      console.log('THATONE');
      return { error: 'Quiz name already in use!', statusCode: 400 };
    }
  }
  return quiz;
}
function validAnswerlengths(questionBody: QuestionObject) {
  for (const a of questionBody.answers) {
    if (a.answer.length < 1 || a.answer.length > 30) {
      return false;
    }
  }
  return true;
}

function checkDuplicateAnswers(questionBody: QuestionBodyObject) {
  const answers = [];
  for (const a of questionBody.answers) {
    for (const b of answers) {
      if (b.answer.includes(a.answer)) {
        return true;
      }
    }
    answers.push(a);
  }
  return false;
}

function checkCorrectAnswers(questionBody: QuestionObject) {
  for (const a of questionBody.answers) {
    if (a.correct === true) {
      return true;
    }
  }
  return false;
}

export function adminTrashEmpty(authUserId: number, quizIds: number[]) {
  const data = getData();
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid User Id', statusCode: 401 };
  }

  if (!checkUserTrash(user.trash, quizIds)) {
    if (!checkUserQuizzes(data.quizzes[authUserId], quizIds)) {
      return { error: "one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", statusCode: 403 };
    }
    return { error: 'One or more of the Quiz IDs is not currently in the trash', statusCode: 400 };
  }

  for (const quizId of quizIds) {
    user.trash.splice(user.trash.findIndex(current => current.quizId === quizId), 1);
  }

  return {};
}

// checks if trash contains quizIds
function checkUserTrash(trash: QuizObject[], quizIds: number[]) {
  for (const quizId of quizIds) {
    if (trash.find(current => current.quizId === quizId) === undefined) {
      return false;
    }
  }
  return true;
}

function checkUserQuizzes(quizzes: QuizObject[], quizIds: number[]) {
  for (const quizId of quizIds) {
    if (quizzes.find(current => current.quizId === quizId) === undefined) {
      return false;
    }
  }
  return true;
}

export function adminQuizQuestionUpdate(authUserId: number, quizId: number, questionId: number, questionBody: QuestionObject): ErrorObjectStatus|EmptyObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);
  const data = getData();
  const colours = ['red', 'orange', 'blue', 'yellow', 'green', 'pink'];

  if (userValidity && userValidity.error) {
    return userValidity;
  }
  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }

  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);

  const questionValidity = validateQuestionBody(quiz, questionBody);

  if (questionValidity && questionValidity.error) {
    return questionValidity;
  }

  const questionIdValidity = validateQuestionId(authUserId, quizId, questionId);

  if (questionIdValidity && questionIdValidity.error) {
    return questionIdValidity;
  }

  if (quiz.duration + questionBody.duration - quiz.questions[questionId].duration > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes', statusCode: 400 };
  }

  const questions = quiz!.questions;
  const quizIndx = data.quizzes[authUserId].findIndex(current => current.quizId === quizId);
  const questionIndx = questions.findIndex(a => a.questionId === questionId);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  const currentQuiz = data.quizzes[authUserId][quizIndx];
  currentQuiz.duration = currentQuiz.duration + questionBody.duration - quiz.questions[questionId].duration;
  data.quizzes[authUserId][quizIndx] = currentQuiz;

  const question: QuestionObject = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers.map((ans, index) => {
      return {
        answerId: index + 1,
        answer: ans.answer,
        colour: colours[Math.floor(Math.random() * colours.length)],
        correct: ans.correct,
      };
    }),
    thumbnailUrl: questionBody.thumbnailUrl
  };
  data.quizzes[authUserId][quizIndx].questions[questionIndx] = question;
  // quiz.questions[questionIndx] = question;

  // before this line please check how questionBody has been converted to questionObject in questionCreation function
  // this line may be changed
  // questions[question] = questionBody
  setData(data);
  return {};
}

function validateQuestionId(authUserId: number, quizId: number, questionId: number): ErrorObjectStatus|null {
  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const index = quizzes.findIndex(quiz => quiz.quizId === quizId);

  const quiz = quizzes[index];
  if (quiz === undefined || !quiz.questions) {
    return { error: 'This question does not belong to the quiz', statusCode: 400 };
  }
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);

  if (questionIndex === -1) {
    return { error: 'This question does not belong to the quiz', statusCode: 400 };
  }
}

export function quizQuestionMove(quizId: number, authUserId: number, questionId: number, newPosition: number) {
  const data = getData();
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid user Id' };
  }

  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  if (quiz === undefined) {
    return { error: 'User is not the owner of this quiz', statusCode: 403 };
  }

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    return { error: 'Invalid question Id', statusCode: 400 };
  }

  if (newPosition < 0 || newPosition >= quiz.questions.length) {
    return { error: 'New position is less than 0 or greater than the number of questions', statusCode: 400 };
  }

  if (questionIndex === newPosition) {
    return { error: 'New position is the current position of the question', statusCode: 400 };
  }

  const [movedQuestion] = quiz.questions.splice(questionIndex, 1);
  quiz.questions.splice(newPosition, 0, movedQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return { statusCode: 200, message: 'Question moved successfully' };
}

function validateQuestionBody(quiz: QuizObject, questionBody: QuestionObject) {
  if (questionBody.question.length > 50 || questionBody.question.length < 5) {
    return { error: 'Question is less than 5 characters or greater than 50 characters', statusCode: 400 };
  }
  if (questionBody.answers.length > 6 || questionBody.answers.length < 2) {
    return { error: 'The question has more than 6 or less than 2 answers', statusCode: 400 };
  }
  if (questionBody.duration < 0) {
    return { error: 'The question duration is not a positive number', statusCode: 400 };
  }

  if (questionBody.points > 10 || questionBody.points < 1) {
    return { error: 'The points awarded for the question are less than 1 or greater than 10', statusCode: 400 };
  }

  if (!validAnswerlengths(questionBody)) {
    return { error: 'Answer is shorter than 1 character, or longer than 30 characters', statusCode: 400 };
  }

  if (checkDuplicateAnswers(questionBody)) {
    return { error: 'Any answer strings are duplicates of one another (within the same question)', statusCode: 400 };
  }
  if (!checkCorrectAnswers(questionBody)) {
    return { error: 'There are no correct answers', statusCode: 400 };
  }
}

export function adminQuizQuestionDelete(authUserId: number, quizId: number, questionId: number): ErrorObjectStatus|EmptyObject {
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);
  const questionValidity = validateQuestionId(authUserId, quizId, questionId);

  if (userValidity && userValidity.error) {
    return userValidity;
  }

  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }
  if (questionValidity && questionValidity.error) {
    return questionValidity;
  }
  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(a => a.quizId === quizId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  quiz.questions.splice(questionIndex, 1);
  setData(data);
  return {};
}

export function adminQuizQuestionDuplicate(authUserId:number, quizId:number, questionId:number) {
  console.log('USER: ', authUserId);
  console.log('QUIZ: ', quizId);
  console.log('QUESTION', questionId);
  const userValidity = validateUserId(authUserId);
  const quizIdValidity = validateQuizId(quizId, authUserId);
  const questionValidity = validateQuestionId(authUserId, quizId, questionId);
  if (userValidity && userValidity.error) {
    return userValidity;
  }

  if (quizIdValidity && quizIdValidity.error) {
    return quizIdValidity;
  }
  if (questionValidity && questionValidity.error) {
    return questionValidity;
  }
  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(a => a.quizId === quizId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  const dupliQuestion = { ...quiz.questions[questionIndex], questionId: Math.floor(Math.random() * 1000000) };
  quiz.questions.splice(questionIndex + 1, 0, dupliQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return { newQuestionId: dupliQuestion.questionId };
}
*/
