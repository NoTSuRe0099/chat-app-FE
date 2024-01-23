import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export interface User {
  _id: string;
  name: string;
  email: string;
}
export interface IChats {
  [key: string]: IChat[];
}
export interface IChat {
  senderId: string;
  receiverId: string;
  message: string;
  sentAt: Date | string;
}

export interface IChatState {
  users: User[];
  chats: IChats;
  currentChat: IChat[];
}
const storedUserList = sessionStorage.getItem('userList')
  ? JSON.parse(sessionStorage.getItem('userList'))
  : null;
const initialState: IChatState = {
  users: storedUserList || [],
  chats: {},
  currentChat: [],
};

const ChatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setAllUsers: (state, action: PayloadAction<User[] | []>) => {
      sessionStorage.setItem('userList', JSON.stringify(action?.payload));
      state.users = action?.payload || [];
    },
    pushNewCurrentChat: (state, action: PayloadAction<IChat>) => {
      state.currentChat = [...state.currentChat, action?.payload];
    },
    flushMessages: (state) => {
      state.currentChat = [];
      state.chats = {};
    },
    pushNewMessage: (state, action: PayloadAction<any>) => {
      const { id, chat } = action.payload;
      const _id = String(id);
      const _chats = { ...state?.chats };
      //@ts-ignore
      _chats[_id] = _chats[_id]?.length > 0 ? [..._chats[_id], chat] : [chat];

      state.chats = _chats;
    },
  },
});

export const {
  setAllUsers,
  pushNewCurrentChat,
  flushMessages,
  pushNewMessage,
} = ChatSlice.actions;

// Selector to access auth state
export const selectChatState = (state: RootState) => state.chatState;

export default ChatSlice.reducer;
