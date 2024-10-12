import { SOME_ACTION } from './types'; // Adjusted import path

// Define action types
export const ANOTHER_ACTION = 'ANOTHER_ACTION';

// Define action creators
export const someAction = (payload: string) => ({
  type: 'SOME_ACTION',
  payload
});

export const anotherAction = (payload: any) => ({
  type: ANOTHER_ACTION,
  payload
});

export { SOME_ACTION } from './types';
