import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  access_token: string | null;
}

const storedUserData = JSON.parse(localStorage.getItem('authState')!);

export const authSliceInitialState: AuthState = {
  user: storedUserData?.user || null,
  isAuthenticated: storedUserData?.isAuthenticated || false,
  access_token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authSliceInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

// Selector to access auth state
export const selectAuth = (state: RootState) => state.authState;

export default authSlice.reducer;
