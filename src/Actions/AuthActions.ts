import { createAsyncThunk } from '@reduxjs/toolkit';
import { authSliceInitialState, clearUser, setUser } from '../auth/AuthSlice';
import callApi from '../functions/apiClient';

export const registerAction = createAsyncThunk(
  'auth/register',
  async (data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'POST',
      url: '/auth/register',
      data: data,
    });
    thunkAPI.dispatch(fetchUserData(null));
    return response.data;
  }
);

export const loginAction = createAsyncThunk(
  'auth/login',
  async (params: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'POST',
      url: '/auth/login',
      data: params,
    });
    thunkAPI.dispatch(fetchUserData(null));

    return response.data;
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUser',
  async (_data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: '/auth/me',
    });
    thunkAPI.dispatch(setUser(response?.data?.data));
    localStorage.setItem(
      'authState',
      JSON.stringify({
        user: response.data?.data,
        isAuthenticated: true,
      })
    );
    return response.data;
  }
);

export const logoutAction = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: '/auth/logout',
    });
    thunkAPI.dispatch(clearUser());
    localStorage.setItem('authState', JSON.stringify(authSliceInitialState));
    return response.data;
  }
);
