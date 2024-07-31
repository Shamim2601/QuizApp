// other.ts

import { setData, DataObject, EmptyObject } from './dataStore';

export function clear(): EmptyObject {
  const emptyData: DataObject = {
    users: [],
    quizzes: {},
    sessions: {},
  };

  setData(emptyData);

  return {};
}
