import roomsReducer from '../roomsReducer';
import * as types from '../../actions/types';

describe('rooms reducer', () => {
  it('should return the initial state', () => {
    expect(roomsReducer(undefined, {})).toEqual([]);
  });

  it('should handle SET_ROOMS', () => {
    const rooms = [
      { id: '1', name: 'Room 1' },
      { id: '2', name: 'Room 2' }
    ];
    expect(
      roomsReducer([], {
        type: types.SET_ROOMS,
        payload: rooms
      })
    ).toEqual(rooms);
  });

  it('should handle ADD_ROOM', () => {
    const initialState = [
      { id: '1', name: 'Room 1' }
    ];
    const newRoom = { id: '2', name: 'Room 2' };
    expect(
      roomsReducer(initialState, {
        type: types.ADD_ROOM,
        payload: newRoom
      })
    ).toEqual([...initialState, newRoom]);
  });

  it('should handle REMOVE_ROOM', () => {
    const initialState = [
      { id: '1', name: 'Room 1' },
      { id: '2', name: 'Room 2' }
    ];
    expect(
      roomsReducer(initialState, {
        type: types.REMOVE_ROOM,
        payload: '1'
      })
    ).toEqual([{ id: '2', name: 'Room 2' }]);
  });

  it('should handle UPDATE_ROOM', () => {
    const initialState = [
      { id: '1', name: 'Room 1' },
      { id: '2', name: 'Room 2' }
    ];
    const updatedRoom = { id: '1', name: 'Updated Room 1' };
    expect(
      roomsReducer(initialState, {
        type: types.UPDATE_ROOM,
        payload: updatedRoom
      })
    ).toEqual([updatedRoom, { id: '2', name: 'Room 2' }]);
  });
});
