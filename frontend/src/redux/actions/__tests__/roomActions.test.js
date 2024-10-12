import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import * as actions from '../roomActions';
import * as types from '../types';

jest.mock('axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('room actions', () => {
  it('should create an action to set rooms', () => {
    const rooms = [{ id: '1', name: 'Room 1' }, { id: '2', name: 'Room 2' }];
    const expectedAction = {
      type: types.SET_ROOMS,
      payload: rooms
    };
    expect(actions.setRooms(rooms)).toEqual(expectedAction);
  });

  it('should create an action to add a room', () => {
    const room = { id: '3', name: 'Room 3' };
    const expectedAction = {
      type: types.ADD_ROOM,
      payload: room
    };
    expect(actions.addRoom(room)).toEqual(expectedAction);
  });

  it('should create an action to remove a room', () => {
    const roomId = '1';
    const expectedAction = {
      type: types.REMOVE_ROOM,
      payload: roomId
    };
    expect(actions.removeRoom(roomId)).toEqual(expectedAction);
  });

  it('should handle fetchRooms action', () => {
    const rooms = [{ id: '1', name: 'Room 1' }, { id: '2', name: 'Room 2' }];
    axios.get.mockResolvedValue({ data: rooms });

    const expectedActions = [
      { type: types.SET_ROOMS, payload: rooms }
    ];

    const store = mockStore({ rooms: [] });

    return store.dispatch(actions.fetchRooms())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('should handle createRoom action', () => {
    const newRoom = { id: '3', name: 'New Room' };
    axios.post.mockResolvedValue({ data: newRoom });

    const expectedActions = [
      { type: types.ADD_ROOM, payload: newRoom }
    ];

    const store = mockStore({ rooms: [] });

    return store.dispatch(actions.createRoom({ name: 'New Room' }))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('should handle deleteRoom action', () => {
    const roomId = '1';
    axios.delete.mockResolvedValue({});

    const expectedActions = [
      { type: types.REMOVE_ROOM, payload: roomId }
    ];

    const store = mockStore({ rooms: [{ id: '1', name: 'Room 1' }] });

    return store.dispatch(actions.deleteRoom(roomId))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
});
