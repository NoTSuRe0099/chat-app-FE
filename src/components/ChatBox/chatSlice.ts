import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../auth/AuthSlice';
import { RootState } from '../../store';
import { IChatState, ISingleUserChat } from '../../Types/chatSliceTypes';

const storedUserList = sessionStorage.getItem('userList')
  ? JSON.parse(sessionStorage.getItem('userList'))
  : null;

const initialState: IChatState = {
  users: storedUserList || [],
  chats: {},
  currentChat: [],
  chatGroups: [],
  chatGroupMessages: {},
  usersForGroupInvt: [],
  currentUsersGroupInvites: []
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
    pushNewCurrentChat: (state, action: PayloadAction<ISingleUserChat>) => {
      state.currentChat = [...state.currentChat, action?.payload];
    },
    flushMessages: (state) => {
      state.currentChat = [];
      state.chats = {};
    },
    setMyChatgroups: (state, action: PayloadAction<any>) => {
      state.chatGroups = action?.payload;
    },
    setGroupChatUserForInvite: (state, action: PayloadAction<any>) => {
      state.usersForGroupInvt = action?.payload;
    },
    setGroupChatInvites: (state, action: PayloadAction<any>) => {
      state.currentUsersGroupInvites = action?.payload;
    },
    pushNewMessage: (state, action: PayloadAction<any>) => {
      const { id, chat } = action.payload;
      const _id = String(id);
      const _chats = { ...state?.chats };
      //@ts-ignore
      _chats[_id] = _chats[_id]?.length > 0 ? [..._chats[_id], chat] : [chat];

      state.chats = _chats;
    },
    pushNewGroupChatMessage: (state, action: PayloadAction<any>) => {
      const { id, chat } = action.payload;
      const chatGroupMessages = { ...state.chatGroupMessages };

      // const index = _chatGroups?.findIndex((group) => group?._id === id);

      // if (index !== -1) {
      //   _chatGroups[index].messages = chat;
      // }

      // state.chatGroups = _chatGroups;

      const _id = String(id);
      //@ts-ignore
      chatGroupMessages[_id] =
        chatGroupMessages[_id]?.length > 0
          ? [...chatGroupMessages?.[_id], chat]
          : [chat];

      state.chatGroupMessages = chatGroupMessages;
    },
  },
});

export const {
  setAllUsers,
  pushNewCurrentChat,
  flushMessages,
  pushNewMessage,
  setMyChatgroups,
  pushNewGroupChatMessage,
  setGroupChatUserForInvite,
  setGroupChatInvites
} = ChatSlice.actions;

// Selector to access auth state
export const selectChatState = (state: RootState) => state.chatState;

export default ChatSlice.reducer;
