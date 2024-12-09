import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadChatsAction } from '../../Actions/ChatActions';
import { ChatTypeEnum } from '../../Enums';
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
import ChatContent from './ChatContent';
import ChatHeader from './ChatHeader';
import MessageInputBox from './MessageInputBox';
import {
  changeIsTypingUserStatus,
  incrementChatLoadPage,
  selectChatState,
} from './chatSlice';

interface IProps {
  chatUser?: chatUser;
  messages: ISingleUserChat[] | IChat[];
  user: User;
  sendMessage: (payload: sendMessageFn) => void;
  messageContainerRef: React.MutableRefObject<any> | null;
  openUserList: () => void;
  isGroupChat: boolean;
  chatGroupInfo?: IgroupChats;
}

const CurrentChatWindow = ({
  chatUser,
  user,
  messages = [],
  sendMessage,
  messageContainerRef,
  openUserList,
  isGroupChat = false,
  chatGroupInfo,
}: IProps) => {
  const [message, setMessage] = useState('');
  const [isEmojiDrawerOpen, setIsEmojiDrawerOpen] = useState(false);
  const [isInvtUserModalOpen, setIsInvtUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);
  const { currentChat, activlyTypingUserList } = chatState;
  const { pagination, chats } = currentChat;
  const { page, totalPages } = pagination;
  const params = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('IS_USER_TYPING', handleTypingStatus);
    }

    return () => {
      bluredHandler();
      socket?.off('IS_USER_TYPING', handleTypingStatus);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollableDivRef.current) {
        scrollableDivRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading, page, totalPages, dispatch]);

  useEffect(() => {
    if (page) {
      loadMoreData();
    }
  }, [page, params?.id, params?.chatType]);

  useEffect(() => {
    setMessage('');
  }, [params?.id, params?.chatType]);

  const handleTypingStatus = (data: { senderId: string; isTyping: boolean; }) => {
    const { senderId, isTyping } = data;
    dispatch(changeIsTypingUserStatus({ senderId, isTyping }));
  };

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

  const handleEmoji = (e: { emoji: string; }) => {
    setMessage((prev) => prev + e.emoji);
  };

  const openUserInvtModal = () => {
    setIsInvtUserModalOpen(true);
  };

  const closeUserInvtModal = () => {
    setIsInvtUserModalOpen(false);
  };

  const getUserDetailsById = (userId: string) => {
    return chatState.users?.find((user) => user?._id === userId);
  };

  const handleSubmitMessage = ({
    messageType,
    mediaUrl,
  }: {
    messageType: string;
    mediaUrl?: string;
  }) => {
    sendMessage({ message, mediaUrl, messageType });
    scrollToBottom();
    setMessage('');
  };

  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTo({
        top: scrollableDivRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    const div = scrollableDivRef.current;
    if (div && div.scrollTop === 0 && !loading && page < totalPages) {
      dispatch(incrementChatLoadPage());
    }
  };

  const loadMoreData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        type: isGroupChat ? ChatTypeEnum.GROUP_CHAT : ChatTypeEnum.USER,
      });

      if (isGroupChat && chatGroupInfo?._id) {
        queryParams.append('groupId', chatGroupInfo._id);
      } else if (chatUser?._id) {
        queryParams.append('receiverId', params.id as string);
      }

      dispatch(
        //@ts-ignore
        loadChatsAction({
          queryParams: `?${queryParams.toString()}`,
          callback: handleScrollAfterLoad,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScrollAfterLoad = () => {
    if (!scrollableDivRef.current) return;

    setTimeout(() => {
      if (page === 1) {
        scrollToBottom();
      } else {
        scrollableDivRef.current.scrollTo({
          top: 1000,
          behavior: 'smooth',
        });
      }
    }, 0);
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

        <ChatContent
          scrollableDivRef={scrollableDivRef}
          chats={chats}
          user={user}
          getUserDetailsById={getUserDetailsById}
          messageContainerRef={messageContainerRef}
        />

        <MessageInputBox
          handleSubmitMessage={handleSubmitMessage}
          handleEmoji={handleEmoji}
          setIsEmojiDrawerOpen={setIsEmojiDrawerOpen}
          isEmojiDrawerOpen={isEmojiDrawerOpen}
          setMessage={setMessage}
          message={message}
          focusedHandler={fucusedHandler}
          blurredHandler={bluredHandler}
          chatUser={chatUser}
          activlyTypingUserList={activlyTypingUserList}
        />
      </div>
    </>
  );
};

export default CurrentChatWindow;
