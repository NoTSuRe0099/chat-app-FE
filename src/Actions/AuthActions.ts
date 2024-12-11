import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  authSliceInitialState,
  clearUser,
  setAccessToken,
  setUser,
} from '../auth/AuthSlice';
import callApi, { callPublicApi } from '../functions/apiClient';

export const registerAction = createAsyncThunk(
  'auth/register',
  async (data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'POST',
      url: '/auth/register',
      data: data,
    });
    thunkAPI.dispatch(setAccessToken(response?.data?.data));
    if (response?.data?.data) {
      localStorage.setItem(
        'authState',
        JSON.stringify({
          access_token: response.data?.data?.access_token,
          isAuthenticated: true,
        })
      );
    }
    thunkAPI.dispatch(fetchUserData(null));
    return response.data;
  }
);

export const loginAction = createAsyncThunk(
  'auth/login',
  async (params: any, thunkAPI) => {
    const response: any = await callPublicApi({
      method: 'POST',
      url: '/auth/login',
      data: params,
    });
    thunkAPI.dispatch(setAccessToken(response?.data?.data));
    if (response?.data?.data) {
      localStorage.setItem(
        'authState',
        JSON.stringify({
          access_token: response.data?.data?.access_token,
          isAuthenticated: true,
        })
      );
    }
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
    const storedUserData = JSON.parse(localStorage.getItem('authState')!) || {};
    localStorage.setItem(
      'authState',
      JSON.stringify({
        ...storedUserData,
        user: response.data?.data,
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
