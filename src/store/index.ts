// store.ts

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/AuthSlice'; // Check if the path is correct
import chatReducer from '../components/ChatBox/chatSlice';

const rootReducer = combineReducers({
  authState: authReducer,
  chatState: chatReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
