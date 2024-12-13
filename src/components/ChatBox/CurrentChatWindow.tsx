import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadChatsAction } from '../../Actions/ChatActions';
import { ChatTypeEnum, EventTypes } from '../../Enums';
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
  deleteMessage,
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
      socket.on('IS_USER_TYPING', (data) => {
        handleTypingStatus(data);
      });
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

  const handleTypingStatus = (data: { senderId: string; isTyping: boolean; groupId: string; }) => {
    const { senderId, isTyping, groupId } = data;
    dispatch(changeIsTypingUserStatus({ senderId, isTyping, groupId }));
  };

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e?.target;
    setMessage(value);
    if (value.length > 0) {
      fucusedHandler();
    } else {
      bluredHandler();
    }

  };

  const fucusedHandler = () => {
    if (message.length > 0) {
      socket?.emit('USER_TYPING', {
        senderId: user?._id,
        groupId: params?.chatType === ChatTypeEnum.GROUP_CHAT ? params?.id : "",
        receiverId: params?.chatType === ChatTypeEnum.USER ? params?.id : "",
        groupUserList: params?.chatType === ChatTypeEnum.GROUP_CHAT ? chatGroupInfo?.userList?.map(({ _id }) => _id) : null,
        isTyping: true,
      });
    }
  };

  const bluredHandler = () => {
    socket?.emit('USER_TYPING', {
      senderId: user?._id,
      groupId: params?.chatType === ChatTypeEnum.GROUP_CHAT ? params?.id : "",
      receiverId: params?.chatType === ChatTypeEnum.USER ? params?.id : "",
      groupUserList: params?.chatType === ChatTypeEnum.GROUP_CHAT ? chatGroupInfo?.userList?.map(({ _id }) => _id) : null,
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
      setTimeout(() => {
        scrollableDivRef.current.scrollTo({
          top: scrollableDivRef.current.scrollHeight * scrollableDivRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 0);

    }
  };

  const handleScroll = () => {
    const div = scrollableDivRef.current;
    if (div && div.scrollTop === 0 && !loading && page < totalPages) {
      dispatch(incrementChatLoadPage());
    }
  };

  const loadMoreData = () => {
    if (loading) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        type: isGroupChat ? ChatTypeEnum.GROUP_CHAT : ChatTypeEnum.USER,
      });

      if (isGroupChat && chatGroupInfo?._id) {
        queryParams.append('groupId', params.id);
      } else if (!isGroupChat && chatUser?._id) {
        queryParams.append('receiverId', params.id as string);
      }

      if ((isGroupChat && chatGroupInfo?._id) || (!isGroupChat && chatUser?._id)) {
        dispatch(
          loadChatsAction({
            queryParams: `?${queryParams.toString()}`,
            callback: handleScrollAfterLoad,
          }) as any
        );
      }

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
          top: 50,
          behavior: 'smooth',
        });
      }
    }, 0);
  };

  const handleDelete = (messageId: string) => {
    console.log(`Delete message with ID: ${messageId}`);
    if (params?.chatType === ChatTypeEnum.USER) {
      dispatch(deleteMessage({ messageId }));
    }
    socket.emit(EventTypes.DELETE_MESSAGE_IN, {
      messageId,
      groupId: params?.chatType === ChatTypeEnum.GROUP_CHAT ? params?.id : "",
      senderId: user?._id,
      receiverId: params?.chatType === ChatTypeEnum.USER ? params?.id : "",
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
          handleDelete={handleDelete}
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
          chatGroupInfo={chatGroupInfo}
          handleMessageInput={handleMessageInput}
        />
      </div>
    </>
  );
};

export default CurrentChatWindow;
