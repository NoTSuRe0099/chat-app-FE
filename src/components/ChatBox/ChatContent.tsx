import React, { MutableRefObject } from 'react';
import { ICurrentChats } from '../../Types/chatSliceTypes';

interface Chat {
  senderId: string;
  message: string;
  sentAt: string;
}

interface User {
  _id: string;
}

interface ChatsContentProps {
  scrollableDivRef: MutableRefObject<HTMLDivElement | null>;
  chats: ICurrentChats[];
  user: User;
  getUserDetailsById: (id: string) => { name: string; } | undefined;
  activlyTypingUserList: Record<string, boolean>;
  chatUser: User;
  messageContainerRef: MutableRefObject<HTMLDivElement | null>;
}

const ChatContent: React.FC<ChatsContentProps> = ({
  scrollableDivRef,
  chats,
  user,
  getUserDetailsById,
  activlyTypingUserList,
  chatUser,
  messageContainerRef,
}) => {
  return (
    <div
      ref={scrollableDivRef}
      className="relative w-full p-6 overflow-y-auto h-full bg-gray-50"
    >
      {chats?.length ? (
        <ul className="space-y-4">
          {chats.map((chat, index) => (
            <li
              key={`_${index}`}
              className={`flex ${chat?.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative max-w-xl md:w-auto break-words px-5 py-3 bg-white rounded-lg shadow-lg h-auto">
                <span className="block text-sm font-medium text-gray-900 mb-1">
                  {chat?.senderId === user?._id ? 'You' : getUserDetailsById(chat?.senderId)?.name}
                </span>
                <p className="block text-gray-700 w-max text-left">{chat?.message}</p>
                <span className="block mt-2 text-xs text-gray-500">
                  {new Date(chat?.sentAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full text-center">
          <p className="text-lg font-semibold text-gray-500">No messages to display.</p>
        </div>
      )}
      {activlyTypingUserList?.[chatUser._id] && (
        <div className="typing-indicator typing-in-chat-box-indicator sticky">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}
      <div ref={messageContainerRef} />
    </div>
  );
};

export default ChatContent;
