import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../auth/AuthSlice';
import { RootState } from '../../store';
import {
  IChatState,
  ICurrentChat,
  ICurrentChats,
  ISingleUserChat,
} from '../../Types/chatSliceTypes';

const storedUserList = sessionStorage.getItem('userList')
  ? JSON.parse(sessionStorage.getItem('userList'))
  : null;

const initialState: IChatState = {
  users: storedUserList || [],
  chats: {},
  currentChat: {
    pagination: {
      limit: 0,
      page: 1,
      total: 0,
      totalPages: 0,
    },
    chats: [],
  },
  chatGroups: [],
  chatGroupMessages: {},
  usersForGroupInvt: [],
  currentUsersGroupInvites: [],
  activlyTypingUserList: {},
};

const ChatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setAllUsers: (state, action: PayloadAction<User[] | []>) => {
      action?.payload &&
        sessionStorage.setItem('userList', JSON.stringify(action?.payload));
      state.users = action?.payload || [];
    },
    loadCurrentChat: (state, action: PayloadAction<ICurrentChat>) => {
      console.log('asdasda', action?.payload);

      const _chats = [...action?.payload?.chats, ...state?.currentChat?.chats];
      state.currentChat.chats = _chats;
      state.currentChat.pagination = action?.payload?.pagination;
    },
    pushNewCurrentChat: (state, action: PayloadAction<ICurrentChats>) => {
      state.currentChat.chats = [...state.currentChat.chats, action.payload];
    },
    clearCurrentChat: (state, action: PayloadAction<ISingleUserChat>) => {
      state.currentChat = initialState.currentChat;
    },
    flushMessages: (state) => {
      state.currentChat = initialState.currentChat;
      state.chats = {};
    },
    incrementChatLoadPage: (state) => {
      state.currentChat.pagination.page += 1;
    },
    setMyChatgroups: (state, action: PayloadAction<any>) => {
      state.chatGroups = action?.payload;
    },
    setGroupChatUserForInvite: (state, action: PayloadAction<any>) => {
      state.usersForGroupInvt = action?.payload;
    },
    setGroupChatInvites: (state, action: PayloadAction<any>) => {
      state.currentUsersGroupInvites = action?.payload || [];
    },
    pushNewMessage: (state, action: PayloadAction<any>) => {
      const { id, chat } = action.payload;
      const _id = String(id);
      const _chats = { ...state?.chats };
      _chats[_id] = _chats[_id]?.length > 0 ? [..._chats[_id], chat] : [chat];
      state.chats = _chats;
    },
    pushNewGroupChatMessage: (state, action: PayloadAction<any>) => {
      const { id, chat } = action.payload;
      const chatGroupMessages = { ...state.chatGroupMessages };
      const _id = String(id);
      chatGroupMessages[_id] =
        chatGroupMessages[_id]?.length > 0
          ? [...chatGroupMessages?.[_id], chat]
          : [chat];

      state.chatGroupMessages = chatGroupMessages;
    },
    changeIsTypingUserStatus: (state, action: PayloadAction<any>) => {
      const { senderId, isTyping } = action.payload;
      console.log('action.payload', action.payload);

      if (isTyping) {
        state.activlyTypingUserList[senderId] = true;
      } else {
        delete state.activlyTypingUserList[senderId];
      }
    },
  },
});

export const {
  setAllUsers,
  loadCurrentChat,
  flushMessages,
  pushNewMessage,
  setMyChatgroups,
  pushNewGroupChatMessage,
  setGroupChatUserForInvite,
  setGroupChatInvites,
  clearCurrentChat,
  incrementChatLoadPage,
  pushNewCurrentChat,
  changeIsTypingUserStatus,
} = ChatSlice.actions;

// Selector to access chat state
export const selectChatState = (state: RootState) => state.chatState;

export default ChatSlice.reducer;
