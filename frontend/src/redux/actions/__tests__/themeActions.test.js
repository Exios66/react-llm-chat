import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as themeActions from '../themeActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('theme actions', () => {
  it('should create an action to set dark mode', () => {
    const isDarkMode = true;
    const expectedAction = {
      type: 'SET_DARK_MODE',
      payload: isDarkMode,
    };
    expect(themeActions.setDarkMode(isDarkMode)).toEqual(expectedAction);
  });

  it('should handle toggleDarkMode action', () => {
    const initialState = { theme: { darkMode: false } };
    const store = mockStore(initialState);

    store.dispatch(themeActions.toggleDarkMode());
    const actions = store.getActions();

    expect(actions[0]).toEqual({
      type: 'SET_DARK_MODE',
      payload: true,
    });
  });

  it('should toggle dark mode from true to false', () => {
    const initialState = { theme: { darkMode: true } };
    const store = mockStore(initialState);

    store.dispatch(themeActions.toggleDarkMode());
    const actions = store.getActions();

    expect(actions[0]).toEqual({
      type: 'SET_DARK_MODE',
      payload: false,
    });
  });
});
