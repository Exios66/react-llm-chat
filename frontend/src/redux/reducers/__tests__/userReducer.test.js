import userReducer from '../userReducer';
import * as types from '../../actions/types';

describe('user reducer', () => {
  it('should return the initial state', () => {
    expect(userReducer(undefined, {})).toEqual({
      id: null,
      name: null,
      isAuthenticated: false
    });
  });

  it('should handle SET_USER', () => {
    const user = { id: '1', name: 'John Doe' };
    expect(
      userReducer(undefined, {
        type: types.SET_USER,
        payload: user
      })
    ).toEqual({
      ...user,
      isAuthenticated: true
    });
  });

  it('should handle CLEAR_USER', () => {
    const initialState = { id: '1', name: 'John Doe', isAuthenticated: true };
    expect(
      userReducer(initialState, {
        type: types.CLEAR_USER
      })
    ).toEqual({
      id: null,
      name: null,
      isAuthenticated: false
    });
  });
});
