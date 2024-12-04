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
  access_token: storedUserData?.access_token || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authSliceInitialState,
  reducers: {
    setAccessToken: (
      state,
      action: PayloadAction<{ access_token: string } | null>
    ) => {
      state.isAuthenticated = !!action.payload?.access_token;
      state.access_token = action?.payload?.access_token;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser, setAccessToken } = authSlice.actions;

// Selector to access auth state
export const selectAuth = (state: RootState) => state.authState;

export default authSlice.reducer;
