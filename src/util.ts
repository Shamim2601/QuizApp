import { SessionObject, UserObject, getData } from './dataStore';

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

export function getSessionFromId(sessionId: number): SessionObject | null {
  const data = getData();
  const sessions = data.sessions;
  for (const key in sessions) {
    if (Object.prototype.hasOwnProperty.call(sessions, key)) {
      const sessionObjects = sessions[key];
      for (let i = 0; i < sessionObjects.length; i++) {
        if (sessionObjects[i].sessionId === sessionId) {
          return sessionObjects[i];
        }
      }
    }
  }
  return null;
}

// export function getPlayerFromPlayerId(playerId: number): PlayerObject | null {
//   console.log(playerId);
//   const data = getData();
//   const sessions = data.sessions;
//   console.log(data.sessions);
//   for (const key in sessions) {
//     if (sessions.hasOwnProperty(key)) {
//       const sessionObjects = sessions[key];
//       for (let i = 0; i < sessionObjects.length; i++) {
//         const session = sessionObjects[i];
//         console.log(session);
//         for (let j = 0; j < session.players.length; j++) {
//           const player = session.players[j];
//           console.log(player);
//           if (player.playerId == playerId) {
//             console.log('success');
//             return player;
//           }
//         }
//       }
//     }
//   }
//   return null;
// }

export function getSessionFromPlayerId(playerId: number): SessionObject| null {
  const data = getData();
  const sessions = data.sessions;
  for (const key in sessions) {
    if (Object.prototype.hasOwnProperty.call(sessions, key)) {
      const sessionObjects = sessions[key];
      for (let i = 0; i < sessionObjects.length; i++) {
        const session = sessionObjects[i];
        for (let j = 0; j < sessionObjects[i].players.length; j++) {
          const player = sessionObjects[i].players[j];
          if (player.playerId === playerId) {
            return session;
          }
        }
      }
    }
  }
  return null;
}

export function checkPlayerExistence(name: string, sessionId: number): boolean {
  const session = getSessionFromId(sessionId);
  let existence = false;
  if (session.players.length === 0) {
    return false;
  }
  session.players.forEach((player) => {
    if (player.name === name) {
      existence = true;
    }
  });
  return existence;
}
