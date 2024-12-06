import React from 'react';

interface ChatHeaderProps {
  openUserList: () => void;
  isGroupChat: boolean;
  chatUser: {
    isOnline: boolean;
    name?: string;
  };
  chatGroupInfo?: {
    name?: string;
  };
  profileAvatar: string;
  addUserIcon: string;
  openUserInvtModal: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  openUserList,
  isGroupChat,
  chatUser,
  chatGroupInfo,
  profileAvatar,
  addUserIcon,
  openUserInvtModal,
}) => {
  return (
    <div className="relative flex items-center justify-between p-3 border-b border-gray-300">
      <div className="flex items-center">
        <button className="md:hidden" onClick={openUserList}>
          <img src={profileAvatar} alt="profile-avatar" />
        </button>
        {!isGroupChat && (
          <div className="relative">
            <img
              className="object-cover w-10 h-10 rounded-full"
              src="https://static.vecteezy.com/system/resources/previews/026/619/142/non_2x/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
              alt="username"
            />
            <span
              className={`absolute w-3 h-3 ${
                chatUser.isOnline ? 'bg-green-600' : 'bg-red-600'
              } rounded-full left-6 top-1`}
            ></span>
          </div>
        )}
        <span className="block ml-2 font-bold text-gray-600">
          {isGroupChat ? chatGroupInfo?.name : chatUser?.name || 'NA'}
        </span>
      </div>
      {isGroupChat && (
        <button onClick={openUserInvtModal}>
          <img className="h-4" src={addUserIcon} alt="Add User" />
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
