import { useCallback, useEffect, useRef, useState } from 'react';
import {
  chatUser,
  IChat,
  IgroupChats,
  ISingleUserChat,
  User,
} from '../../Types/chatSliceTypes';
import addUserIcon from '../../assets/addUserIcon.svg';
import GroupChatInviteModal from '../GroupChatInviteModal/GroupChatInviteModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeIsTypingUserStatus,
  clearCurrentChat,
  incrementChatLoadPage,
  selectChatState,
} from './chatSlice';
import { loadChatsAction } from '../../Actions/ChatActions';
import { ChatTypeEnum } from '../../Enums';
import { useSocket } from '../../context/SocketContext';

interface Iprops {
  chatUser?: chatUser;
  messages: ISingleUserChat[] | IChat[];
  user: User;
  sendMessage: (message: string) => void;
  messageContainerRef: React.MutableRefObject<any> | null;
  openUserList: () => void;
  isGroupChat: boolean;
  chatGroupInfo?: IgroupChats;
}

const CurrentChatWindow = (props: Iprops) => {
  const {
    chatUser,
    user,
    messages = [],
    sendMessage,
    messageContainerRef,
    openUserList,
    isGroupChat = false,
    chatGroupInfo,
  } = props;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);
  const { currentChat, activlyTypingUserList } = chatState;
  const { pagination, chats } = currentChat;
  const { page, limit } = pagination;

  const handleSubmitMessage = () => {
    sendMessage(message);
    setMessage('');
  };

  const [isInvtUserModalOpen, setIsInvtUserModalOpen] = useState(false);

  const openUserInvtModal = () => {
    setIsInvtUserModalOpen(true);
  };

  const closeUserInvtModal = () => {
    setIsInvtUserModalOpen(false);
  };

  const getUserDetailsById = (userId: string) => {
    return chatGroupInfo.userList?.find((user) => user?._id === userId);
  };

  // Function to load more data when scroll reaches the bottom
  const loadMoreData = useCallback(async () => {
    dispatch(
      //@ts-ignore
      loadChatsAction({
        queryParams: `?type=${
          isGroupChat ? ChatTypeEnum.GROUP_CHAT : ChatTypeEnum.USER
        }&receiverId=${chatUser._id}&page=${page || 1}&limit=${15}`,
      })
    );
  }, [page, chatUser?._id]);

  useEffect(() => {
    loadMoreData();
    messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatUser?._id]);

  // Handler for scroll event
  const handleScroll = useCallback(() => {
    const div = scrollableDivRef.current;
    if (div) {
      // Check if user has scrolled to the top
      if (div.scrollTop === 0 && !loading) {
        // loadMoreData();
        // if (page === limit) {
        dispatch(incrementChatLoadPage());
        // }
      }
    }
  }, [loading, loadMoreData]);

  useEffect(() => {
    const div = scrollableDivRef.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (div) {
        div.removeEventListener('scroll', handleScroll);
      }
      dispatch(clearCurrentChat());
    };
  }, [handleScroll]);

  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket?.on('IS_USER_TYPING', (data) => {
        const { senderId, isTyping } = data;
        dispatch(changeIsTypingUserStatus({ senderId, isTyping }));
      });
    }

    return () => {
      bluredHandler();
    };
  }, [socket]);

  const fucusedHandler = () => {
    socket?.emit('USER_TYPING', {
      senderId: user?._id,
      receiverId: chatUser?._id,
      isTyping: true,
    });
  };

  const bluredHandler = () => {
    socket?.emit('USER_TYPING', {
      senderId: user?._id,
      receiverId: chatUser?._id,
      isTyping: false,
    });
  };

  return (
    <>
      {isInvtUserModalOpen && (
        <GroupChatInviteModal
          onClose={closeUserInvtModal}
          groupId={chatGroupInfo?._id}
        />
      )}
      <div className="w-full flex flex-col justify-between h-full">
        <div className="relative flex items-center justify-between p-3 border-b border-gray-300">
          <div className="flex items-center ">
            <button className="md:hidden" onClick={openUserList}>
              <svg
                height="25"
                viewBox="0 0 48 48"
                width="48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h48v48h-48z" fill="none" />
                <path d="M40 22h-24.34l11.17-11.17-2.83-2.83-16 16 16 16 2.83-2.83-11.17-11.17h24.34v-4z" />
              </svg>
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
        <div
          ref={scrollableDivRef}
          className="relative w-full p-6 overflow-y-auto h-full bg-gray-50"
        >
          {chats?.length ? (
            <ul className="space-y-4">
              {chats?.map((chat, index: number) => (
                <li
                  key={`_${index}`}
                  className={`flex ${
                    chat?.senderId === user?._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div className="relative max-w-xl md:w-auto break-words px-5 py-3 bg-white rounded-lg shadow-lg h-auto">
                    <span className="block text-sm font-medium text-gray-900 mb-1">
                      {chat?.senderId === user?._id
                        ? 'You'
                        : getUserDetailsById(chat?.senderId)?.name}
                    </span>
                    <p className="block text-gray-700 w-max text-left">
                      {chat?.message}
                    </p>
                    <span className="block mt-2 text-xs text-gray-500">
                      {new Date(chat?.sentAt)?.toLocaleDateString()}
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

          {/* Typing indicator */}
          {activlyTypingUserList?.has(chatUser._id) && (
            <div className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}

          <div ref={messageContainerRef} />
        </div>
        <form
          onSubmit={(e) => {
            e?.preventDefault();
            handleSubmitMessage();
          }}
          className="flex items-center justify-between w-full p-3 border-t border-gray-300 min-h-[41px]"
        >
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            type="text"
            onChange={(e) => setMessage(e?.target?.value)}
            value={message}
            placeholder="Message"
            className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
            name="message"
            required
            onFocus={() => {
              fucusedHandler();
            }}
            onBlur={() => {
              bluredHandler();
            }}
          />
          <button type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          <button type="submit">
            <svg
              className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};

export default CurrentChatWindow;
