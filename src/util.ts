import { UserObject, getData } from './dataStore';

export function getUserFromToken(token:string):UserObject|null {
  const data = getData();
  for (const user of data.users) {
    for (const session of user.sessions) {
      if (session === token) {
        return user;
      }
    }
  }
  return null;
}
