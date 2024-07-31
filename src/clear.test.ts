import { clear } from './other';
import { getData } from './dataStore';

describe('Clear function tests', () => {
  it('should clear all users and quizzes', () => {
    clear();
    const data = getData();
    expect(data.users).toEqual([]);
    expect(data.quizzes).toEqual({});
    expect(data.sessions).toEqual({});
  });
});
