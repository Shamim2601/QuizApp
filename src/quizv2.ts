import { getUserFromToken } from './auth';
import { UserObject, ErrorObject, QuizObject, setData, getData, /* DataObject, */ EmptyObject, ErrorObjectStatus, QuestionObject, QuestionBodyObject, State } from './dataStore';
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
  // const userValidity = validateUserId(authUserId); gonna comment this since 401 SHOULD be handled in the server the way I understand the code
  const quizNameValidity = validateQuizName(name, authUserId);
  const descriptionValidity = validateDescription(description);
  /*
  if (userValidity && userValidity.error) {
    throw new Error(userValidity.error)
  } */
  if (quizNameValidity && quizNameValidity.error) {
    console.log('ERROR: ', quizNameValidity.error);
    throw new Error(quizNameValidity.error);
  }
  if (descriptionValidity && descriptionValidity.error) {
    throw new Error(descriptionValidity.error);
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
    duration: 0,
    thumbnailUrl: null
  });

  return { quizId: id };
}

// Stub for the adminQuizRemove function
// Returns an empty object
export function adminQuizRemove(authUserId: number, quizId: number): ErrorObjectStatus|EmptyObject {
  const quizIdValidity = validateQuizId(quizId, authUserId);

  if (quizIdValidity && quizIdValidity.error) {
    throw new Error(quizIdValidity.error);
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
  const quizIdValidity = validateQuizId(quizId, authUserId);

  if (quizIdValidity && quizIdValidity.error) {
    throw new Error(quizIdValidity.error);
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const quiz = quizzes.find(q => q.quizId === quizId);

  return quiz;
}

// Stub for the adminQuizNameUpdate function
// Returns an empty object

export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): ErrorObjectStatus|EmptyObject {
  const quizNameValidity = validateQuizName(name, authUserId);
  if (quizNameValidity && quizNameValidity.error) {
    throw new Error(quizNameValidity.error);
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
  const descriptionValidity = validateDescription(description);

  if (descriptionValidity && descriptionValidity.error) {
    throw new Error(descriptionValidity.error);
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
    throw new Error('Invalid Token!');
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
// Idk where this is used in all honesty, just gonna keep it here in case I need it later, will delete if not.
// If this is still here I forgot mb lol
/* function validateUserId(authUserId: number): ErrorObjectStatus|null {
  const users = getData().users;
  const uIndex = users.findIndex(user => user.authUserId === authUserId);

  if (uIndex === -1) {
    return { error: 'User is not a valid user', statusCode: 401 };
  }
}
*/
function validateQuizName(name: string, authUserId: number): ErrorObject|null {
  if (name.length < 3) {
    return { error: 'Invalid quiz name input! Quiz name should be greater than two characters.' };
  }
  if (name.length > 30) {
    return { error: 'Invalid quiz name input! Quiz name should be less than thirty characters.' };
  }

  const valid = /^[a-zA-Z\s0-9]{3,30}$/;
  if (!valid.test(name)) {
    return { error: 'Invalid quiz name input! Quiz name should not contain any symbols.' };
  }

  const data = getData();
  const quizzes = data.quizzes[authUserId];

  if (!quizzes) {
    return;
  }

  const index = quizzes.findIndex(quiz => quiz.name === name);

  if (index !== -1) {
    return { error: 'Quiz name is already used by the current logged in user for another quiz.' };
  }
}

function validateDescription(description: string): ErrorObject|null {
  if (description.length > 100) {
    return { error: 'Invalid description! Description should be less than a hundred characters.' };
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
  console.log(data);
  const sessionCheck = checkSessionStateEndForQuiz(quizId);
  const userWithEmail = data.users.find(current => current.email === userEmail);
  if (sessionCheck && sessionCheck.error) {
    throw new Error('Session not in end state!');
  }
  if (userWithEmail === undefined) {
    throw new Error('User email is not a real user');
  }

  if (userEmail === user.email) {
    throw new Error('Provided User email is currently loggined');
  }
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);

  if (userWithEmail.authUserId in data.quizzes) {
    const quizWithSameName = data.quizzes[userWithEmail.authUserId].find(current => current.name === quiz.name);
    if (quizWithSameName !== undefined) {
      throw new Error('Quiz name is already used by this user');
    }
  }

  if (!(userWithEmail.authUserId.toString() in data.quizzes)) {
    data.quizzes[userWithEmail.authUserId] = [];
  }

  data.quizzes[userWithEmail.authUserId].push(quiz);
  data.quizzes[authUserId].splice(data.quizzes[authUserId].findIndex(a => a.quizId === quizId), 1);
  setData(data);
  return {};
}

export function quizQuestionCreate(quizId:number, authUserId: number, questionBody :QuestionObject) {
  const data = getData();
  // const user = data.users.find(current => current.authUserId === authUserId);
  // 403 error

  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  // 400 errors
  /*
  if (questionBody.question.length > 50 || questionBody.question.length < 5) {
    throw new Error('Question is less than 5 characters or greater than 50 characters');
  }
  if (questionBody.answers.length > 6 || questionBody.answers.length < 2) {
    throw new Error('The question has more than 6 or less than 2 answers');
  }
  if (questionBody.duration < 0) {
    throw new Error('The question duration is not a positive number');
  }

  if (quiz.duration + questionBody.duration > 180) {
    throw new Error('The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points > 10 || questionBody.points < 1) {
    throw new Error('The points awarded for the question are less than 1 or greater than 10');
  }

  if (!validAnswerlengths(questionBody)) {
    throw new Error('Answer is shorter than 1 character, or longer than 30 characters');
  }

  if (checkDuplicateAnswers(questionBody)) {
    throw new Error('Any answer strings are duplicates of one another (within the same question)');
  }
  if (!checkCorrectAnswers(questionBody)) {
    throw new Error('There are no correct answers');
  }
  */
  createQuizQuestion400errors(questionBody, quiz);

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

function createQuizQuestion400errors(questionBody :QuestionObject, quiz: QuizObject) {
  if (questionBody.question.length > 50 || questionBody.question.length < 5) {
    throw new Error('Question is less than 5 characters or greater than 50 characters');
  }
  if (questionBody.answers.length > 6 || questionBody.answers.length < 2) {
    throw new Error('The question has more than 6 or less than 2 answers');
  }
  if (questionBody.duration <= 0) {
    throw new Error('The question duration is not a positive number');
  }

  if (quiz.duration + questionBody.duration > 180) {
    throw new Error('The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points > 10 || questionBody.points < 1) {
    throw new Error('The points awarded for the question are less than 1 or greater than 10');
  }

  if (!validAnswerlengths(questionBody)) {
    throw new Error('Answer is shorter than 1 character, or longer than 30 characters');
  }

  if (checkDuplicateAnswers(questionBody)) {
    throw new Error('Any answer strings are duplicates of one another (within the same question)');
  }
  if (!checkCorrectAnswers(questionBody)) {
    throw new Error('There are no correct answers');
  }
  validateThumbnailUrl(questionBody.thumbnailUrl);
}

export function adminQuizRestore(authUserId:number, quizId:number):EmptyObject|ErrorObjectStatus {
  const data = getData();
  const user = getUserFromId(authUserId);
  let quiz;
  if ('trash' in user) {
    quiz = user.trash.find(current => current.quizId === quizId);
    if (quiz === undefined) {
      throw new Error('Quiz does not exist!');
    }
  }

  data.quizzes[authUserId].push(quiz);
  return {};
}

/* function checkQuizValidRestore(data:DataObject, quizId:number, authUserId:number):QuizObject|ErrorObject {
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  const user = data.users.find(current => current.authUserId === authUserId);

  if (quiz !== undefined) {
    console.log('THISONE');
    return { error: 'Quiz not in restore!' };
  }

  for (const quizName of data.quizzes[authUserId]) {
    if (quizName.name === quiz.name) {
      console.log('THATONE');
      return { error: 'Quiz name already in use!' };
    }
  }
  return quiz;
} */
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
  /*
  if (!(checkUserTrash(user.trash, quizIds))) {
    if (!(checkUserQuizzes(data.quizzes[authUserId], quizIds))) {
      return { error: "one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", statusCode: 403 };
    }
    return { error: 'One or more of the Quiz IDs is not currently in the trash', statusCode: 400 };
  }
  */

  const quizInTrash = checkUserTrash(user.trash, quizIds);
  console.log('quizzes', data.quizzes[authUserId]);
  const quizOwned = checkUserQuizzes(data.quizzes[authUserId], quizIds);
  /*
  if(!(quizInTrash) && !(quizOwned)) {
    throw new Error("one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist");
    //return { error: "one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", statusCode: 403 };
  }
  */

  if (quizInTrash === false && quizOwned === true) {
    throw new Error('One or more of the Quiz IDs is not currently in the trash');
    // return { error: 'One or more of the Quiz IDs is not currently in the trash', statusCode: 400 };
  }

  for (const quizId of quizIds) {
    user.trash.splice(user.trash.findIndex(current => current.quizId === quizId), 1);
  }

  return {};
}

export function adminTrashEmpty403(trash: QuizObject[], quizIds: number[], quizzes: QuizObject[]) {
  console.log('in function');
  const quizInTrash = checkUserTrash(trash, quizIds);
  console.log(quizInTrash);
  const quizOwned = checkUserQuizzes(quizzes, quizIds);
  console.log(quizOwned);

  if (quizInTrash === false && quizOwned === false) {
    throw new Error("one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist");
    // return { error: "one or more of the Quiz IDs refers to a quiz that this current user does not own or doesn't exist", statusCode: 403 };
  }
}

export function usersQuizzes(authUserId: number) {
  const data = getData();
  return data.quizzes[authUserId];
}

// checks if trash contains quizIds
function checkUserTrash(trash: QuizObject[], quizIds: number[]) {
  console.log('check user trash');
  const trashIds = trash.map(quiz => quiz.quizId);
  console.log(trashIds);
  for (const quizId of quizIds) {
    if (!(trashIds.includes(quizId))) {
      return false;
    }
  }
  return true;
}

function checkUserQuizzes(quizzes: QuizObject[], quizIds: number[]) {
  const ownedquizIds = quizzes.map(quiz => quiz.quizId);
  console.log('owned', ownedquizIds);
  for (const quizId of quizIds) {
    if (!(ownedquizIds.includes(quizId))) {
      return false;
    }
  }
  return true;
}

export function adminQuizQuestionUpdate(authUserId: number, quizId: number, questionId: number, questionBody: QuestionObject): ErrorObjectStatus|EmptyObject {
  const data = getData();
  const colours = ['red', 'orange', 'blue', 'yellow', 'green', 'pink'];

  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);

  const questionValidity = validateQuestionBody(quiz, questionBody);

  if (questionValidity && questionValidity.error) {
    throw new Error(questionValidity.error);
  }

  const questionIdValidity = validateQuestionId(authUserId, quizId, questionId);

  if (questionIdValidity && questionIdValidity.error) {
    throw new Error(questionIdValidity.error);
  }

  if (quiz.duration + questionBody.duration - quiz.questions[questionId].duration > 180) {
    throw new Error('The sum of the question durations in the quiz exceeds 3 minutes');
  }

  validateThumbnailUrl(questionBody.thumbnailUrl);

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

function validateQuestionId(authUserId: number, quizId: number, questionId: number): ErrorObject|null {
  const data = getData();
  const quizzes = data.quizzes[authUserId];
  const index = quizzes.findIndex(quiz => quiz.quizId === quizId);

  const quiz = quizzes[index];
  if (quiz === undefined || !quiz.questions) {
    return { error: 'This question does not belong to the quiz' };
  }
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);

  if (questionIndex === -1) {
    return { error: 'This question does not belong to the quiz' };
  }
}

export function quizQuestionMove(quizId: number, authUserId: number, questionId: number, newPosition: number) {
  const data = getData();
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    throw new Error('Invalid question Id');
  }

  if (newPosition < 0 || newPosition >= quiz.questions.length) {
    throw new Error('New position is less than 0 or greater than the number of questions');
  }

  if (questionIndex === newPosition) {
    throw new Error('New position is the current position of the question');
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
  const questionValidity = validateQuestionId(authUserId, quizId, questionId);
  const sessionCheck = checkSessionStateEndForQuiz(quizId);
  if (sessionCheck && sessionCheck.error) {
    throw new Error(sessionCheck.error);
  }
  if (questionValidity && questionValidity.error) {
    throw new Error(questionValidity.error);
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
  const questionValidity = validateQuestionId(authUserId, quizId, questionId);

  if (questionValidity && questionValidity.error) {
    throw new Error(questionValidity.error);
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
// Checks for 403 errors, since 401 errors are already abstract
// and our group is making it so that the error thrown by the "main" function
// is 400.
export function serverValidateQuizId(quizId: number, authUserId: number) {
  const quizIdValidity = validateQuizId(quizId, authUserId);
  if (quizIdValidity && quizIdValidity.error) {
    throw new Error(quizIdValidity.error);
  }
}

export function serverValidateQuizInTrash(quizId: number, authUserId: number) {
  const user = getUserFromId(authUserId);
  console.log(quizId);
  console.log('USER: ', user);
  if (user !== null && 'trash' in user) {
    const quiz = user.trash.find(current => current.quizId === quizId);
    console.log('QUIZ: ', quiz);
    if (quiz === undefined) {
      throw new Error('Quiz does not exist!');
    }
  }
}

function validateThumbnailUrl(thumbnailUrl: string) {
  if (thumbnailUrl === '') {
    throw new Error('The thumbnailUrl is an empty string!');
  }

  const validFiletypes = /\.(jpg|jpeg|png)$/i;

  if (!validFiletypes.test(thumbnailUrl)) {
    throw new Error('The thumbnail URL does not end with a valid filetype.');
  }
  const validProtocol = /^(http:\/\/|https:\/\/)/;
  if (!validProtocol.test(thumbnailUrl)) {
    throw new Error("The thumbnail URL does not begin with 'http://' or 'https://'.");
  }
}

export function serverCheckQuizValidRestore(quizId:number, authUserId:number):QuizObject|ErrorObject {
  const data = getData();
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);

  if (quiz !== undefined) {
    console.log('THISONE');
    throw new Error('Quiz not in restore!');
  }

  for (const quizName of data.quizzes[authUserId]) {
    if (quizName.name === quiz.name) {
      console.log('THATONE');
      throw new Error('Quiz name already in use!');
    }
  }
  return quiz;
}

export function checkSessionStateEndForQuiz(quizId: number) {
  const data = getData();
  if (data.sessions[quizId]) {
    for (const session of data.sessions[quizId]) {
      if (session.state !== State.END) {
        return { error: 'Not all sessions for the quiz are in end state!' };
      }
    }
  }
  return {};
}

export function serverCheckSessionStateEndForQuiz(quizId: number) {
  const data = getData();
  if (data.sessions[quizId]) {
    for (const session of data.sessions[quizId]) {
      if (session.state !== State.END) {
        return { error: 'Not all sessions for the quiz are in end state!' };
      }
    }
  }
  return {};
}

export function updateQuizThumbnail(quizId: number, authUserId: number, imgUrl: string) {
  // if 403 or 401 error is not passed

  // 400 errors
  console.log(quizId, authUserId, imgUrl);
  validateThumbnailUrl(imgUrl);
  const data = getData();
  console.log('no errors');
  // implementation
  const quiz = data.quizzes[authUserId].find(current => current.quizId === quizId);
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}
