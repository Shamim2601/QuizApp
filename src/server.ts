import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
// import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserPasswordUpdate, adminUserDetailsUpdate, getUserFromToken, adminAuthLogout } from './auth';
import { clear } from './other';
/* import { adminQuizCreate, adminQuizInfo, adminQuizList, adminQuizRemove, adminQuizRestore, adminQuizTrash, quizTransfer, adminQuizQuestionDelete, adminQuizQuestionDuplicate } from './quiz';
import { adminQuizNameUpdate, adminQuizDescriptionUpdate, quizQuestionCreate, adminTrashEmpty, adminQuizQuestionUpdate, quizQuestionMove } from './quiz'; */
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserPasswordUpdate, adminUserDetailsUpdate, getUserFromToken, adminAuthLogout, validateDetails } from './authv2';
import {
  adminQuizCreate, adminQuizInfo, adminQuizList, adminQuizRemove, adminQuizRestore, adminQuizTrash, quizTransfer, adminQuizQuestionDelete, adminQuizQuestionDuplicate, serverValidateQuizId, adminTrashEmpty403, usersQuizzes, /* serverValidateQuizInTrash */
  serverCheckSessionStateEndForQuiz
} from './quizv2';
import { adminQuizNameUpdate, adminQuizDescriptionUpdate, quizQuestionCreate, adminTrashEmpty, adminQuizQuestionUpdate, quizQuestionMove, serverCheckQuizValidRestore, updateQuizThumbnail } from './quizv2';
import { createSession, quizInTrash, updateState, getSessionStatus, viewActiveAndInactiveSessions, getResultsForSession } from './sessions';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizQuestionDuplicate(user.authUserId, parseInt(req.params.quizId), parseInt(req.params.questionId));
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token;
  const obj = adminQuizTrash(token as string);
  if ('error' in obj) {
    res.status(401).json({
      error: obj.error
    });
  } else {
    res.status(200).json({ quizzes: obj.quizzes });
  }
});

// MOCK CLEAR PLEASE IGNORE/REPLACE CLEAR ISNT EVEN TS HERE
app.delete('/v1/clear', (req:Request, res: Response) => {
  clear();
  res.status(200).send({});
});

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    validateDetails(email, password, nameFirst, nameLast);
    const obj = adminAuthRegister(email, password, nameFirst, nameLast);
    res.status(200).json({
      token: obj.sessionId
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const obj = adminAuthLogin(email, password);
    res.status(200).json({
      token: obj.sessionId
    });
  } catch (e) {
    res.status(400).json({
      error: e.message
    });
  }
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const session = req.query.token;

  if (typeof session !== 'string') {
    return res.status(401).json({ error: 'Token must be a string!' });
  }

  const obj = adminUserDetails(session);
  if ('error' in obj) {
    res.status(401).json({
      error: obj.error
    });
  } else {
    res.status(200).json({
      user: obj.user
    });
  }
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminUserDetailsUpdate(user.authUserId, email, nameFirst, nameLast);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminUserPasswordUpdate(user.authUserId, oldPassword, newPassword);
  if ('error' in result) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token;
  const user = getUserFromToken(token as string);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizList(user.authUserId);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: 'Unknown Type: string - error' });
  }
  const result = adminQuizCreate(user.authUserId, name, description);
  if ('error' in result) {
    return res.status(400).json({ error: 'Unknown Type: string - error' });
  }
  res.json(result);
});

app.get('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizInfo(user.authUserId, parseInt(req.params.quizId));
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizNameUpdate(user.authUserId, parseInt(req.params.quizId), name);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizDescriptionUpdate(user.authUserId, parseInt(req.params.quizId), description);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = quizTransfer(quizId, user.authUserId, userEmail);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const obj = adminAuthLogout(token);

  if ('error' in obj) {
    res.status(401).json({
      error: obj.error
    });
  } else {
    res.status(200).json({
    });
  }
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizRemove(user.authUserId, parseInt(req.params.quizId));
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const user = getUserFromToken(token);

  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }

  const result = quizQuestionCreate(quizId, user.authUserId, questionBody);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }

  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  const user = getUserFromToken(token as string);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizRestore(user.authUserId, quizId);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token;
  const quizIds = [];
  for (const quizId of req.query.quizIds) {
    quizIds.push(parseInt(quizId));
  }
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminTrashEmpty(user.authUserId, quizIds);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }

  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = req.params.quizid;
  const questionId = req.params.questionid;

  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizQuestionUpdate(user.authUserId, parseInt(quizId), parseInt(questionId), questionBody);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.put('/v1/admin/quiz/:quizId/question/:questionId/move', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const authUserId = req.body.authUserId;
  const newPosition = req.body.newPosition;

  const result = quizQuestionMove(quizId, authUserId, questionId, newPosition);

  if (result.statusCode === 200) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const user = getUserFromToken(token);
  if (user === null) {
    return res.status(401).json({ error: "Session doesn't exist!" });
  }
  const result = adminQuizQuestionDelete(user.authUserId, parseInt(req.params.quizId), parseInt(req.params.questionId));
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

/*
    =========================V2 ITERATION 2 FUNCTIONS======================
*/
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const session = req.headers.token;

  if (typeof session !== 'string') {
    return res.status(401).json({ error: 'Token must be a string!' });
  }
  try {
    const obj = adminUserDetails(session);
    res.status(200).json({
      user: obj.user
    });
  } catch (e) {
    res.status(401).json({
      error: e.message
    });
  }
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const session = req.headers.token;
  console.log(session);
  if (typeof session !== 'string') {
    return res.status(401).json({ error: 'Token must be a string!' });
  }
  try {
    adminAuthLogout(session);
    res.status(200).json({});
  } catch (e) {
    res.status(401).json({
      error: e.message
    });
  }
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
  } catch (e) {
    res.status(401).json({
      error: e.message
    });
  }
  try {
    const result = adminUserDetailsUpdate(user.authUserId, email, nameFirst, nameLast);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: e.message
    });
  }
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
  } catch (e) {
    res.status(401).json({
      error: e.message
    });
  }
  try {
    const result = adminUserPasswordUpdate(user.authUserId, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: e.message
    });
  }
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: "Session doesn't exist!" });
    }
  } catch (e) {
    return res.status(500).json('Server Error');
  }

  try {
    const result = adminQuizList(user.authUserId);
    res.status(200).json(result);
  } catch (e) {
    return res.status(400).json(e.message);
  }
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = req.headers.token;

  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizCreate(user.authUserId, name, description);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token;
  try {
    const obj = adminQuizTrash(token as string);
    res.status(200).json({ quizzes: obj.quizzes });
  } catch (e) {
    console.log(e.message);
    res.status(401).json({
      error: e.message
    });
  }
});

app.get('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizInfo(user.authUserId, parseInt(req.params.quizId));
    res.json(result);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  /*
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  } */
});

app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { name } = req.body;
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizNameUpdate(user.authUserId, parseInt(req.params.quizId), name);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizDescriptionUpdate(user.authUserId, parseInt(req.params.quizId), description);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.delete('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  // TODO: One more try catch here to verify the state.
  try {
    serverCheckSessionStateEndForQuiz(parseInt(req.params.quizId));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  try {
    const result = adminQuizRemove(user.authUserId, parseInt(req.params.quizId));
    res.json(result);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token;
  const quizId = parseInt(req.params.quizid);
  let user;

  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverCheckQuizValidRestore(parseInt(req.params.quizid), user.authUserId);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const result = adminQuizRestore(user.authUserId, quizId);
    res.json(result);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token;
  const quizIds = [];
  for (const quizId of req.query.quizIds) {
    quizIds.push(parseInt(quizId));
  }
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const quizzes = usersQuizzes(user.authUserId);
    console.log('server', user.trash);
    console.log('server', quizzes);
    console.log(quizIds);
    adminTrashEmpty403(user.trash, quizIds, quizzes);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminTrashEmpty(user.authUserId, quizIds);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;
  const token = req.headers.token;
  let user;

  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(quizId, user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizTransfer(quizId, user.authUserId, userEmail);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { questionBody } = req.body;
  const token = req.headers.token;
  const quizId = parseInt(req.params.quizid);
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(quizId, user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizQuestionCreate(quizId, user.authUserId, questionBody);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { questionBody } = req.body;
  const token = req.headers.token;
  const quizId = req.params.quizid;
  const questionId = req.params.questionid;

  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizQuestionUpdate(user.authUserId, parseInt(quizId), parseInt(questionId), questionBody);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.delete('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = req.params.quizId;
  console.log(quizId);
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizQuestionDelete(user.authUserId, parseInt(req.params.quizId), parseInt(req.params.questionId));
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.put('/v2/admin/quiz/:quizId/question/:questionId/move', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const newPosition = req.body.newPosition;
  const token = req.headers.token;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizQuestionMove(quizId, user.authUserId, questionId, newPosition);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizQuestionDuplicate(user.authUserId, parseInt(req.params.quizId), parseInt(req.params.questionId));
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/*
    =========================NEW ITERATION 3 FUNCTIONS======================
*/

app.post('/v1/admin/quiz/:quizId/session/start', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const autoStartNum = req.body.autoStartNum;
  const quizId = parseInt(req.params.quizId);

  let user;
  try {
    user = getUserFromToken(token as string);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    serverValidateQuizId(quizId, user.authUserId);
  } catch (e) {
    try {
      quizInTrash(user.trash, quizId);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = createSession(quizId, user.authUserId, autoStartNum);
    res.json(result);
    console.log('l');
  } catch (e) {
    console.log('e');
    return res.status(400).json({ error: e.message });
  }
});

app.put('/v1/admin/quiz/:quizId/session/:sessionId', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  try {
    const result = updateState(parseInt(req.params.sessionId), req.body.action, parseInt(req.params.quizId));
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/v1/admin/quiz/:quizId/session/:sessionId', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  try {
    const result = getSessionStatus(parseInt(req.params.quizId), parseInt(req.params.sessionId));
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.put('/v1/admin/quiz/:quizId/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const imgUrl = req.body.imgUrl as string;
  const quizId = parseInt(req.params.quizId);
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  console.log('server', quizId);
  try {
    serverValidateQuizId(quizId, user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  try {
    const result = updateQuizThumbnail(quizId, user.authUserId, imgUrl);
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/v1/admin/quiz/:quizId/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizId);
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  try {
    serverValidateQuizId(quizId, user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  const result = viewActiveAndInactiveSessions(user.authUserId, quizId);
  res.json(result);
});

app.get('/v1/admin/quiz/:quizId/session/:sessionId/results', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  let user;
  try {
    user = getUserFromToken(token as string);
    if (user === null) {
      return res.status(401).json({ error: 'Unknown Type: string - error' });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  try {
    serverValidateQuizId(parseInt(req.params.quizId), user.authUserId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  try {
    const result = getResultsForSession(parseInt(req.params.quizId), parseInt(req.params.sessionId));
    res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
