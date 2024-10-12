import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import userReducer from './reducers/userReducer';
import roomsReducer from './reducers/roomsReducer';
import themeReducer from './reducers/themeReducer';

const rootReducer = combineReducers({
  user: userReducer,
  rooms: roomsReducer,
  theme: themeReducer,
});

const store = configureStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
