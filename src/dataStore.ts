// import { StringLiteral } from 'typescript';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
const fs = require('fs');

export interface UserObject {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  oldPassword: string[];
  newPassword: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  timeCreated: number|string;
  timeLastEdited: number|string;
  sessions: string[];
  trash: QuizObject[];
}

export interface QuizObject {
  quizId: number;
  name : string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionObject[];
  duration: number;
  thumbnailUrl:string;
}
export type QuizLibrary = {[key: number]: QuizObject[]}

export interface ErrorObjectStatus {
  error: string;
  statusCode: number;
}
export interface QuestionObject {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: AnswerObject[];
  thumbnailUrl: string;
}

export type SessionLibrary = {[key: number]: SessionObject[]}
export type ResultsLibrary = {[key: number]: ResultsObject[]} // the key to this will be the questionId

export enum State {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}
export interface SessionObject { // NOT what we return when getting quizsessionstatus, we may need to make another struct for that
  sessionId: number;
  state: State; // should we use an enum here?
  atQuestion: number; // questionId
  players: PlayerObject[];
  metadata: QuizObject;
  autoStartNum: number;
  results: ResultsObject; // Uses the questionId to store results
}

export interface PlayerObject {
  playerId: number;
  name: string;
  score: number;
  session: number; // We may need this for one of the functions that requires you to get session info through the playerId
}

export interface QuestionResultsObject {
  questionId: number;
  playersCorrectList: string;
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface ResultsObject {
  usersRankedByScore:[] // We push the name along with the score from each player object into this array
  questionResults: QuestionResultsObject[]
}

export interface QuestionBodyObject {
  question: string;
  duration: number;
  points: number;
  answers: answerForQuestionBody[];
  thumbnailUrl: string;
}

export interface answerForQuestionBody {
  answer: string;
  colour: string;
}

export interface AnswerObject {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}
export interface Token {
  sessionId: string
}

export interface ErrorObject {
  error: string;
}

export interface DataObject {
  users: UserObject[];
  quizzes: QuizLibrary;
  sessions: SessionLibrary; // uses quizId as an index to hold all sessions pertaining to the quiz

}
export type EmptyObject = Record<never, never>;

let data:DataObject = {
  users: [],
  quizzes: {},
  sessions: {}
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function loadData() {
  const rawData = fs.readFileSync('./database.json', 'utf-8');
  data = JSON.parse(rawData);
}

function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData:DataObject) {
  fs.writeFileSync('./database.json', JSON.stringify(newData));
  data = newData;
}

loadData();
export { getData, setData };
