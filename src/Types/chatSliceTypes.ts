export interface User {
  _id: string;
  name: string;
  email: string;
}
export interface IChats {
  [key: string]: ISingleUserChat[];
}
export interface IChat {
  senderId: string;
  message: string;
  sentAt: Date | string;
}

export interface IgroupChats {
  name: string;
  _id: string;
  userList: string[];
}

export interface ISingleUserChat extends IChat {
  receiverId: string;
}

export interface IChatGroupMessages {
  [key: string]: IChat[];
}
export interface IChatState {
  users: User[];
  chats: IChats;
  currentChat: ISingleUserChat[];
  chatGroups: IgroupChats[];
  chatGroupMessages: IChatGroupMessages;
}
