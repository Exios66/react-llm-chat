import themeReducer from '../themeReducer';
import * as types from '../../actions/types';

describe('theme reducer', () => {
  it('should return the initial state', () => {
    expect(themeReducer(undefined, {})).toEqual({
      darkMode: false
    });
  });

  it('should handle SET_DARK_MODE', () => {
    expect(
      themeReducer(undefined, {
        type: types.SET_DARK_MODE,
        payload: true
      })
    ).toEqual({
      darkMode: true
    });

    expect(
      themeReducer({ darkMode: true }, {
        type: types.SET_DARK_MODE,
        payload: false
      })
    ).toEqual({
      darkMode: false
    });
  });

  it('should not change state for unknown action', () => {
    const initialState = { darkMode: false };
    expect(
      themeReducer(initialState, {
        type: 'UNKNOWN_ACTION'
      })
    ).toEqual(initialState);
  });
});
