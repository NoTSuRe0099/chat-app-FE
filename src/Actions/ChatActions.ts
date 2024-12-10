import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  loadCurrentChat,
  setAllUsers,
  setGroupChatInvites,
  setGroupChatUserForInvite,
  setMyChatgroups,
} from '../components/ChatBox/chatSlice';
import callApi from '../functions/apiClient';

export const fetchAllUser = createAsyncThunk(
  'auth/fetchUser',
  async (_: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: '/auth/getAllUsers',
    });
    thunkAPI.dispatch(setAllUsers(response?.data?.data));
    return response.data;
  }
);

export const fetchMyChatgroups = createAsyncThunk(
  '/chat/setMyChatgroups',
  async (_: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: '/chat/setMyChatgroups',
    });
    thunkAPI.dispatch(setMyChatgroups(response?.data?.data));
    return response.data;
  }
);

export const fetchGroupChatUserForInvite = createAsyncThunk(
  '/chat/getGroupChatUserForInvite',
  async (params: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: `/chat/getGroupChatUserForInvite/${params?.groupId}`,
    });
    thunkAPI.dispatch(setGroupChatUserForInvite(response?.data?.data));
    return response.data;
  }
);

export const sendGroupInviteToUser = createAsyncThunk(
  '/chat/invtToGroup',
  async (data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'POST',
      url: `/chat/invtToGroup`,
      data: data,
    });
    thunkAPI.dispatch(
      fetchGroupChatUserForInvite({
        groupId: data?.groupId,
      })
    );
    return response.data;
  }
);

export const fetchGroupChatInvites = createAsyncThunk(
  '/chat/getGroupChatRequest',
  async (_: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: `/chat/getGroupChatRequest`,
    });
    thunkAPI.dispatch(setGroupChatInvites(response?.data?.data));
    return response.data;
  }
);

export const groupInvitationAction = createAsyncThunk(
  '/chat/invtRequestAction',
  async (data: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'POST',
      url: `/chat/invtRequestAction`,
      data: data,
    });
    thunkAPI.dispatch(fetchGroupChatInvites(null) as any);
    thunkAPI.dispatch(fetchMyChatgroups(null) as any);

    return response.data;
  }
);

export const loadChatsAction = createAsyncThunk(
  '/chat/loadChats',
  async (params: any, thunkAPI) => {
    const response: any = await callApi({
      method: 'GET',
      url: `/chat/loadChats${params?.queryParams}`,
    });
    thunkAPI.dispatch(loadCurrentChat(response?.data?.data));

    if (params?.callback) params?.callback();

    return response.data;
  }
);
