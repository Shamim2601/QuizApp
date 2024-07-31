import { setData, getData, UserObject, ErrorObject, /* DataObject, Token, */ EmptyObject } from './dataStore';
import validator from 'validator';
const crypto = require('crypto');

// Register a user with an email, password, and names, then returns their authUserId value.
export function adminAuthRegister(email:string, password:string, nameFirst:string, nameLast:string): {sessionId:string} {
  const data = getData();
  // Just gonna push these fields for now since we can always add the other fields in other functions.
  const id = data.users.length;
  const sessionId = JSON.stringify(crypto.randomBytes(32).toString('hex'));
  data.users.push({
    authUserId: id,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    oldPassword: [],
    newPassword: '',
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    timeCreated: Math.floor(Date.now() / 1000), // current timestamp
    timeLastEdited: null,
    sessions: [sessionId],
    trash: []
  });
  return {
    sessionId
  };
}
// Function used to validate names, probably reused in later authfunctions. Feel free to use them.
// I'm using regex here to validate the string instead of iterating through it.
// If you guys wanna learn how there's this video on yt https://www.youtube.com/watch?v=nfa_AAm9cO8&t=342s

function validateName(name:string): ErrorObject|{result:boolean} {
  if (name.length < 2) {
    return { error: 'Invalid name input! Name should be greater than one character.' };
  }
  if (name.length > 20) {
    return { error: 'Invalid name input! Name should be less than twenty characters.' };
  }
  const valid = /^[a-zA-Z'-\s]{2,20}$/;
  if (valid.test(name)) {
    return { result: true };
  } else {
    const withnums = /^[a-zA-Z'-\s0-9]{2,20}$/;
    if (withnums.test(name)) {
      return { error: 'Invalid name input! Name should not contain any numbers.' };
    } else {
      return { error: 'Invalid name input! Name should not contain any symbols.' };
    }
  }
}
// Helper function to validate password. Not using regex here cause we did this during one of
// the labs.
function validatePassword(password: string): ErrorObject|{result:boolean} {
  if (password.length < 8) {
    return { error: 'Invalid password input! Password must be at least 8 characters.' };
  }
  let numCount = 0; let letCount = 0;
  for (let i = 0; i < password.length; i++) {
    if ((password[i] >= 'a' && password[i] <= 'z') || (password[i] >= 'A' && password[i] <= 'Z')) {
      letCount++;
    }
    if (!isNaN(parseInt(password[i]))) {
      numCount++;
    }
  }
  if (letCount === 0) {
    return { error: 'Invalid password input! Password must contain at least one letter.' };
  }
  if (numCount === 0) {
    return { error: 'Invalid password input! Password must contain at least one number.' };
  }
  return { result: true };
}
// Given a registered user's email and password returns their authUserId value.
export function adminAuthLogin(email:string, password:string) {
  const data = getData();
  for (const user of data.users) {
    if (email === user.email) {
      if (user.password === password) {
        user.numSuccessfulLogins++;
        user.numFailedPasswordsSinceLastLogin = 0;
        const sessionId = JSON.stringify(crypto.randomBytes(32).toString('hex'));
        user.sessions.push(sessionId);
        setData(data);
        return {
          sessionId
        };
      } else {
        user.numFailedPasswordsSinceLastLogin++;
        setData(data);
        throw new Error('Wrong Password!');
      }
    }
  }
  throw new Error('Email does not exist!');
}

// Given an admin user's authUserId, return details about the user.
// "name" is the first and last name concatenated with a single space between them.
// Assuming that the function does not need to return all of the fields
// present in the data type and only requires the fields listed in the project spec.
export function adminUserDetails(token:string) {
  getData();
  if (token == null) {
    throw new Error("Session doesn't exist!");
  }

  const user = getUserFromToken(token);

  if (user == null) {
    throw new Error('User not found!');
  } else {
    return {
      user: {
        userId: user.authUserId,
        name: user.nameFirst + ' ' + user.nameLast,
        email: user.email,
        numSuccessfulLogins: user.numSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
      }
    };
  }
}

// Stub for the adminUserDetailsUpdate function
// return an empty object
export function adminUserDetailsUpdate(authUserId : number, email: string, nameFirst: string, nameLast: string) {
  const data = getData();
  // Checking to see if user exists
  // const user = getUserFromToken(token);
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    throw new Error('AuthUserId is not a valid user');
  }
  /* if (user === null) {
    return { error: "Session doesn't exist!" };
  }
  */
  // Check to see if email is used by another user
  const searchEmail = data.users.find(current => current.email === email);
  if (searchEmail !== undefined) {
    if (searchEmail.authUserId !== user.authUserId) {
      throw new Error('Email is currently used by another user');
    }
  }

  // Check if email is valid - excluding current authorised user
  if (validator.isEmail(email) === false) {
    throw new Error('Invalid email address');
  }

  // Check if nameFirst is valid
  const validityCheckFirstName = validateName(nameFirst);

  if ('error' in validityCheckFirstName) {
    throw new Error(validityCheckFirstName.error);
  }
  // Check if nameLast is valid
  const validityCheckLastName = validateName(nameLast);
  if ('error' in validityCheckLastName) {
    throw new Error(validityCheckLastName.error);
  }

  // Update properties of given user
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  user.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}

// Stub for the adminUserPasswordUpdate function
// return an empty object
export function adminUserPasswordUpdate(authUserId : number, oldPassword: string, newPassword: string) {
  const data = getData();
  // Checking to see if user exists
  const user = data.users.find(current => current.authUserId === authUserId);
  if (user === undefined) {
    throw new Error('AuthUserId is not a valid user');
  }

  // Check if the old password is correct
  if (user.password !== oldPassword) {
    throw new Error('Incorrect Old Password');
  }

  // Check if the new password and old password are the same
  if (oldPassword === newPassword) {
    throw new Error('Old Password and New Password match exactly');
  }

  // Check if new password has been used before
  const password = user.oldPassword.find(current => current === newPassword);
  if (password !== undefined) {
    throw new Error('Password has been used before');
  }

  // Check if new password is valid
  const passwordCheck = validatePassword(newPassword);
  if ('error' in passwordCheck) {
    throw new Error(passwordCheck.error);
  }

  user.password = newPassword;
  user.oldPassword.push(oldPassword);
  user.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}

export function adminAuthLogout(token:string):EmptyObject {
  if (token == null) {
    throw new Error('Token is empty!');
  }

  const user = getUserFromToken(token);
  if (user === null) {
    throw new Error("User doesn't exist!");
  } else {
    user.sessions = user.sessions.filter(session => session !== token);
  }
  return {};
}

// RETURNS A USERS DETAILS GIVEN A TOKEN
export function getUserFromToken(token:string):UserObject {
  const data = getData();
  for (const user of data.users) {
    for (const session of user.sessions) {
      if (session === token) {
        return user;
      }
    }
  }
  throw new Error('User Token Invalid!');
}

export function validateDetails(email: string, password: string, nameFirst: string, nameLast: string) {
  // getData() fetches all data currently in dataStore
  const data = getData();

  // Email checking
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email!');
  }

  for (const user of data.users) {
    if (user.email === email) {
      throw new Error('Account with email already registered!');
    }
  }

  // Validate names
  let result = validateName(nameFirst);
  if ('error' in result) {
    throw new Error(result.error);
  }

  result = validateName(nameLast);
  if ('error' in result) {
    throw new Error(result.error);
  }

  result = validatePassword(password);
  if ('error' in result) {
    throw new Error(result.error);
  }
}
