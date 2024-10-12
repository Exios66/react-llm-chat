import axios from 'axios';

export const setRooms = (rooms) => ({
  type: 'SET_ROOMS',
  payload: rooms,
});

export const addRoom = (room) => ({
  type: 'ADD_ROOM',
  payload: room,
});

export const removeRoom = (roomId) => ({
  type: 'REMOVE_ROOM',
  payload: roomId,
});

export const updateRoom = (room) => ({
  type: 'UPDATE_ROOM',
  payload: room,
});

export const fetchRooms = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/rooms`);
      dispatch(setRooms(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  };
};

export const createRoom = (roomData) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/rooms`, roomData);
      dispatch(addRoom(response.data));
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };
};

export const deleteRoom = (roomId) => {
  return async (dispatch) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/rooms/${roomId}`);
      dispatch(removeRoom(roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };
};
