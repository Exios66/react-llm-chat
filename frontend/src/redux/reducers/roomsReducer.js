const initialState = [];

const roomsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ROOMS':
      return action.payload;
    case 'ADD_ROOM':
      return [...state, action.payload];
    case 'REMOVE_ROOM':
      return state.filter(room => room.id !== action.payload);
    case 'UPDATE_ROOM':
      return state.map(room => 
        room.id === action.payload.id ? { ...room, ...action.payload } : room
      );
    default:
      return state;
  }
};

export default roomsReducer;
