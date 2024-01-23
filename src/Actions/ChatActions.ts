import { createAsyncThunk } from '@reduxjs/toolkit';
import { setAllUsers } from '../components/ChatBox/chatSlice';
import callApi from '../functions/apiClient';

export const fetchAllUser = createAsyncThunk(
  'auth/fetchUser',
  async (data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: '/auth/getAllUsers',
    });
    thunkAPI.dispatch(setAllUsers(response?.data?.data));
    return response.data;
  }
);
