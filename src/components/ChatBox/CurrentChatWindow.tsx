import EmojiPicker from 'emoji-picker-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadChatsAction } from '../../Actions/ChatActions';
import { ChatTypeEnum } from '../../Enums';
import {
  chatUser,
  IChat,
  IgroupChats,
  ISingleUserChat,
  User,
} from '../../Types/chatSliceTypes';
import addUserIcon from '../../assets/addUserIcon.svg';
import attachIcon from '../../assets/attachIcon.svg';
import emojiIcon from '../../assets/emojiIcon.svg';
import micIcon from '../../assets/micIcon.svg';
import profileAvatar from '../../assets/profileAvatar.svg';
import sendIcon from '../../assets/sendIcon.svg';
import { useSocket } from '../../context/SocketContext';
import GroupChatInviteModal from '../GroupChatInviteModal/GroupChatInviteModal';
import {
  changeIsTypingUserStatus,
  incrementChatLoadPage,
  selectChatState,
} from './chatSlice';

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
  const [isEmojiDrawerOpen, setIsEmojiDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);
  const { currentChat, activlyTypingUserList } = chatState;
  const { pagination, chats } = currentChat;
  const { page, limit, totalPages } = pagination;
  const params = useParams();

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
    if (loading) return; // Prevent loading if already in progress

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        type: isGroupChat ? ChatTypeEnum.GROUP_CHAT : ChatTypeEnum.USER, // Adjust based on chat type
      });
      console.log('isGroupChat', isGroupChat, chatGroupInfo?._id);

      // Append the correct ID based on chat type
      if (isGroupChat && chatGroupInfo?._id) {
        queryParams.append('groupId', chatGroupInfo._id);
      } else if (chatUser?._id) {
        queryParams.append('receiverId', chatUser._id);
      }

      // Dispatch action with built query
      dispatch(
        //@ts-ignore
        loadChatsAction({ queryParams: `?${queryParams.toString()}` })
      );

      // Handle scrolling logic after data load
      handleScrollAfterLoad();
    } finally {
      setLoading(false);
    }
  }, [page, isGroupChat, loading, params?.id, params?.chatType]);

  const handleScrollAfterLoad = () => {
    if (!messageContainerRef?.current) return;

    if (page === 1) {
      // Scroll to bottom for the first page
      messageContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Scroll to a specific position for subsequent pages
      messageContainerRef.current.scrollTo({
        top: 1000, // Adjust the height as needed
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (page) {
      loadMoreData();
    }
  }, [page, params?.id, params?.chatType]);

  useEffect(() => {
    setMessage("");
  }, [params?.id, params?.chatType]);

  // Handler for scroll event
  const handleScroll = useCallback(() => {
    const div = scrollableDivRef.current;
    if (div) {
      // Check if user has scrolled to the top (or near the top, adjust threshold as needed)
      if (div.scrollTop === 0 && !loading) {
        // Only load more data if there are more pages to load
        if (page < totalPages) {
          dispatch(incrementChatLoadPage());
        }
      }
    }
  }, [loading, page, totalPages, dispatch]);

  useEffect(() => {
    const div = scrollableDivRef.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (div) {
        div.removeEventListener('scroll', handleScroll);
      }
      // dispatch(clearCurrentChat());
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

  const handleEomoji = (e) => {
    setMessage((prev) => prev + e?.emoji);
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
                  className={`absolute w-3 h-3 ${chatUser.isOnline ? 'bg-green-600' : 'bg-red-600'
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
                  className={`flex ${chat?.senderId === user?._id
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
          {activlyTypingUserList?.[chatUser._id] && (
            <div className="typing-indicator typing-in-chat-box-indicator sticky">
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
          className="flex items-center justify-between w-full p-3 border-t border-gray-300 min-h-[41px] "
        >

          <button onClick={() => setIsEmojiDrawerOpen((prev) => !prev)} className="w-6 h-6 text-gray-500 relative" type="button">
            <div className="absolute bottom-14"><EmojiPicker onEmojiClick={handleEomoji} open={isEmojiDrawerOpen} /></div>
            <img className="text-gray-500" src={emojiIcon} alt="emoji-icon" />
          </button>
          <button className="w-6 h-6 text-gray-500" type="button">
            <img className="text-gray-500" src={attachIcon} alt="file-icon" />
          </button>

          <input
            type="text"
            onChange={(e) => {
              setMessage(e?.target?.value);
            }}
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
          <button className="w-6 h-6" type="button">
            <img src={micIcon} alt="mic-icon" />
          </button>
          <button className="w-6 h-6 rotate-90" type="submit">
            <img src={sendIcon} alt="send-icon" />
          </button>
        </form>
      </div>
    </>
  );
};

export default CurrentChatWindow;
