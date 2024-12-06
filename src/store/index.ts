// store.ts

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/AuthSlice'; // Check if the path is correct
import chatReducer from '../components/ChatBox/chatSlice';
import UISlice from '../reducers/UISlice';
import { enableMapSet } from 'immer';

// Enable support for Map and Set
enableMapSet();

const rootReducer = combineReducers({
  authState: authReducer,
  chatState: chatReducer,
  UIState: UISlice,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
