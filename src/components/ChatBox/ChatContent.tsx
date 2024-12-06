import React, { MutableRefObject } from 'react';
import { ICurrentChats } from '../../Types/chatSliceTypes';

interface Chat {
  senderId: string;
  message: string;
  sentAt: string;
  messageType?: string; // Add this line
}

interface User {
  _id: string;
}

interface ChatsContentProps {
  scrollableDivRef: MutableRefObject<HTMLDivElement | null>;
  chats: ICurrentChats[];
  user: User;
  getUserDetailsById: (id: string) => { name: string } | undefined;
  messageContainerRef: MutableRefObject<HTMLDivElement | null>;
}

const ChatContent: React.FC<ChatsContentProps> = ({
  scrollableDivRef,
  chats,
  user,
  getUserDetailsById,
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
              className={`flex ${
                chat?.senderId === user?._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="relative max-w-xl md:w-auto break-words px-5 py-3 bg-white rounded-lg shadow-lg h-auto">
                <span className="block text-sm font-medium text-gray-900 mb-1">
                  {chat?.senderId === user?._id
                    ? 'You'
                    : getUserDetailsById(chat?.senderId)?.name}
                </span>
                {chat?.messageType === 'MEDIA' ? (
                  <>
                    <img
                      src={chat?.mediaUrl}
                      alt="Media"
                      className="max-w-xs max-h-xs w-32 h-32 object-contain"
                    />
                    {chat?.message.length > 0 && (
                      <p className="block text-gray-700 w-max text-left mt-2">
                        {chat?.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="block text-gray-700 w-max text-left">
                    {chat?.message}
                  </p>
                )}
                <span className="block mt-2 text-xs text-gray-500">
                  {new Date(chat?.sentAt).toLocaleTimeString() +
                    ' ' +
                    new Date(chat?.sentAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full text-center">
          <p className="text-lg font-semibold text-gray-500">
            No messages to display.
          </p>
        </div>
      )}

      <div ref={messageContainerRef} />
    </div>
  );
};

export default ChatContent;
