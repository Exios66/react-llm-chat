import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../userActions';
import * as types from '../types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('user actions', () => {
  it('should create an action to set a user', () => {
    const user = { id: '1', name: 'John Doe' };
    const expectedAction = {
      type: types.SET_USER,
      payload: user
    };
    expect(actions.setUser(user)).toEqual(expectedAction);
  });

  it('should create an action to clear a user', () => {
    const expectedAction = {
      type: types.CLEAR_USER
    };
    expect(actions.clearUser()).toEqual(expectedAction);
  });

  it('should handle loginUser action', () => {
    const user = { id: '1', name: 'John Doe' };
    const store = mockStore({});

    return store.dispatch(actions.loginUser(user))
      .then(() => {
        const expectedActions = [
          { type: types.SET_USER, payload: user }
        ];
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('should handle logoutUser action', () => {
    const store = mockStore({});

    return store.dispatch(actions.logoutUser())
      .then(() => {
        const expectedActions = [
          { type: types.CLEAR_USER }
        ];
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
});
