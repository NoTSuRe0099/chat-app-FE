export interface User {
  _id: string;
  name: string;
  email: string;
}
export interface IChats {
  [key: string]: ISingleUserChat[];
}


export interface IgroupChats {
  name: string;
  _id: string;
  userList: User[];
}
export interface IChat {
  senderId: string;
  message: string;
  sentAt: Date | string;
}
export interface ISingleUserChat extends IChat {
  receiverId: string;
}

export interface IChatGroupMessages {
  [key: string]: IChat[];
}

export interface IUsersForGroupInvt {
  _id: string;
  name: string;
  requestExists: boolean;
}
export interface IChatState {
  users: User[];
  chats: IChats;
  currentChat: ISingleUserChat[];
  chatGroups: IgroupChats[];
  chatGroupMessages: IChatGroupMessages;
  usersForGroupInvt: IUsersForGroupInvt[];
  currentUsersGroupInvites: IGroupInvites[];
}

export interface IUserDetails {
  _id: string;
  name: string;
}

export interface IGroupDetails {
  _id: string;
  name: string;
}

export interface IGroupInvites {
  _id: string;
  senderId: string;
  receiverId: string;
  groupId: string;
  isAccepted: boolean;
  createdAt: string;
  sender_details: IUserDetails;
  group_details: IGroupDetails;
}
