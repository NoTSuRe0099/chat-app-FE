import EmojiPicker from 'emoji-picker-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadChatsAction } from '../../Actions/ChatActions';
import { ChatTypeEnum, MessageType } from '../../Enums';
import {
  chatUser,
  IChat,
  IgroupChats,
  ISingleUserChat,
  sendMessageFn,
  User,
} from '../../Types/chatSliceTypes';
import addUserIcon from '../../assets/addUserIcon.svg';
import profileAvatar from '../../assets/profileAvatar.svg';
import { useSocket } from '../../context/SocketContext';
import GroupChatInviteModal from '../GroupChatInviteModal/GroupChatInviteModal';
import {
  changeIsTypingUserStatus,
  incrementChatLoadPage,
  selectChatState,
} from './chatSlice';
import cloudinary from 'cloudinary';
import { publicApi } from '../../functions/apiClient';
import MessageInputBox from './MessageInputBox';
import ChatHeader from './ChatHeader';
import ChatContent from './ChatContent';

interface Iprops {
  chatUser?: chatUser;
  messages: ISingleUserChat[] | IChat[];
  user: User;
  sendMessage: (payload: sendMessageFn) => void;
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
  const { page, totalPages } = pagination;
  const params = useParams();


  const handleSubmitMessage = ({ messageType, mediaUrl }: { messageType: string, mediaUrl?: string; }) => {
    sendMessage({ message, mediaUrl: mediaUrl, messageType: messageType });
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
    return chatState.users?.find((user) => user?._id === userId);
  };

  // Function to load more data when scroll reaches the bottom
  const loadMoreData = async () => {
    if (loading) return; // Prevent loading if already in progress

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        type: isGroupChat ? ChatTypeEnum.GROUP_CHAT : ChatTypeEnum.USER, // Adjust based on chat type
      });

      // Append the correct ID based on chat type
      if (isGroupChat && chatGroupInfo?._id) {
        queryParams.append('groupId', chatGroupInfo._id);
      } else if (chatUser?._id) {
        queryParams.append('receiverId', params?.id);
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
  };

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
    console.log('params?.id', params?.id);
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
        <ChatHeader
          openUserList={openUserList}
          isGroupChat={isGroupChat}
          chatUser={chatUser}
          chatGroupInfo={chatGroupInfo}
          profileAvatar={profileAvatar}
          addUserIcon={addUserIcon}
          openUserInvtModal={openUserInvtModal}
        />

        <ChatContent scrollableDivRef={scrollableDivRef}
          chats={chats}
          user={user}
          getUserDetailsById={getUserDetailsById}
          activlyTypingUserList={activlyTypingUserList}
          chatUser={chatUser}
          messageContainerRef={messageContainerRef}
        />

        <MessageInputBox handleSubmitMessage={handleSubmitMessage}
          handleEmoji={handleEomoji}
          setIsEmojiDrawerOpen={setIsEmojiDrawerOpen}
          isEmojiDrawerOpen={isEmojiDrawerOpen}
          setMessage={setMessage}
          message={message}
          focusedHandler={fucusedHandler}
          blurredHandler={bluredHandler} />
      </div>
    </>
  );
};

export default CurrentChatWindow;
