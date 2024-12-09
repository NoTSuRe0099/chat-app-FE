import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAllUser, fetchGroupChatInvites } from '../../Actions/ChatActions';
import { ChatTypeEnum, EventTypes } from '../../Enums';
import {
  IChat,
  ISingleUserChat,
  IgroupChats,
  User,
  chatUser,
  sendMessageFn,
} from '../../Types/chatSliceTypes';
import { selectAuth } from '../../auth/AuthSlice';
import { useSocket } from '../../context/SocketContext';
import CurrentChatWindow from './CurrentChatWindow';
import UserList from './UserList';
import {
  flushMessages,
  pushNewCurrentChat,
  pushNewMessage,
  selectChatState,
} from './chatSlice';

const audioUrl = '/notification-sound-7062.mp3';

const ChatPage = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);
  const authState = useSelector(selectAuth);
  const params = useParams();
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);

  const [currentChatUser, setCurrentChatUser] = useState<User | null>(null);
  const [onlineUsersList, setOnlineUsersList] = useState<string[]>([]);
  const [toggleUserList, setToggleUserList] = useState(true);
  const [currentChatGroup, setCurrentChatGroup] = useState<IgroupChats | null>(
    null
  );

  const chatUser: chatUser = {
    ...currentChatUser!,
    isOnline: onlineUsersList?.includes(currentChatUser?._id!),
  };

  useEffect(() => {
    if (params?.id && params?.chatType === ChatTypeEnum.USER) {
      const user = chatState?.users?.find((user) => user?._id === params?.id);
      setCurrentChatUser(user!);
      setToggleUserList(false);
    } else if (params?.id && params?.chatType === ChatTypeEnum.GROUP_CHAT) {
      const groupChatState =
        params?.chatType === ChatTypeEnum.GROUP_CHAT
          ? chatState?.chatGroups?.find((it) => it?._id === params?.id)
          : null;
      setCurrentChatGroup(groupChatState);
      setToggleUserList(false);
    } else {
      setToggleUserList(true);
    }
  }, [params?.id, params?.chatType]);

  useEffect(() => {
    dispatch(flushMessages());
  }, [currentChatUser]);

  useEffect(() => {
    //@ts-ignore
    dispatch(fetchAllUser());
    if (!('Notification' in window)) {
      console.log('Browser does not support desktop notification');
    } else {
      Notification.requestPermission();
    }
  }, []);

  const getUserByUserId = (senderId: string) => {
    return chatState?.users?.find((user) => user?._id === senderId);
  };

  const sendNotification = (data: ISingleUserChat) => {
    const userObj = getUserByUserId(data?.senderId);
    const message = `${userObj?.name}: ${data?.message}`;

    // create a notification object
    const greeting = new Notification(`New Message from: ${userObj?.name}`, {
      body: message,
      icon: './img/goodday.png',
    });

    greeting.addEventListener('click', function () {
      const targetURL = `${import.meta.env.VITE_BASE_API_URL}/chat/${userObj?._id
        }`;

      // Create a button to trigger the new tab
      const openButton = document.createElement('button');
      openButton.textContent = 'Open Chat';
      openButton.addEventListener('click', function () {
        window.open(targetURL, '_blank');
      });

      // Append the button to the document
      document.body.appendChild(openButton);
    });
  };

  const showNotification = (
    title: string,
    body: string,
    navigateTo: string,
    userId?: string
  ) => {
    if (document.hidden) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      new Audio(audioUrl)?.play();
    } else {
      toast((t) => (
        <span className="flex gap-2 items-center">
          {body}
          {userId && (
            <button
              className="px-3 py-2 font-medium bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm"
              onClick={() => {
                navigate(navigateTo);
                toast.dismiss(t?.id);
              }}
            >
              Open Chat
            </button>
          )}
        </span>
      ));
    }
  };

  useEffect(() => {
    if (socket) {
      // Handler for individual messages
      socket?.on(EventTypes.RECEIVE_MESSAGE, (data: ISingleUserChat) => {
        console.log('user data', data);
        dispatch(pushNewMessage({ id: data?.senderId, chat: data }));
        if (chatUser?._id === data?.senderId) {
          dispatch(
            pushNewCurrentChat({
              ...data,
              _id: crypto.randomUUID(),
              type: ChatTypeEnum.USER,
            })
          );
        }

        messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });

        const userId = params?.id;

        if (userId !== data?.senderId) {
          const user = getUserByUserId(data?.senderId);
          showNotification(
            'New Message',
            `New Message from ${user?.name}`,
            `/chat/user/${data?.senderId}`,
            data?.senderId
          );
        }
      });

      // Handler for group messages
      socket?.on(EventTypes.RECEIVE_GROUP_MESSAGE, (data) => {
        const { groupId, message, senderId } = data;
        console.log('group data', data);

        dispatch(
          pushNewCurrentChat({
            ...data,
            _id: crypto.randomUUID(),
            type: ChatTypeEnum.GROUP_CHAT,
          })
        );

        if (senderId !== authState?.user?._id) {
          showNotification(
            'New Group Message',
            `Message from ${getUserByUserId(senderId)?.name}`,
            `/chat/group/${groupId}`,
            senderId
          );
        }
      });

      // Handler for updated online users
      socket?.on(EventTypes.UPDATED_ONLINE_USERS, (data: string[]) => {
        setOnlineUsersList(data);
      });

      socket?.on(EventTypes.NEW_GROUP_INVITATION, (data) => {
        //@ts-ignore
        dispatch(fetchGroupChatInvites());
        new Audio(audioUrl)?.play();
        console.log('NEW_GROUP_CREATED', data);
      });

      // Cleanup on component unmount
      return () => {
        socket?.off(EventTypes.RECEIVE_MESSAGE);
        socket?.off(EventTypes.RECEIVE_GROUP_MESSAGE);
        socket?.off(EventTypes.UPDATED_ONLINE_USERS);
        socket?.off(EventTypes.NEW_GROUP_INVITATION);
      };
    }
  }, [socket, params?.id, chatUser?._id, dispatch]);

  const sendMessage = (payload: sendMessageFn) => {
    if (socket) {
      if (params?.chatType === ChatTypeEnum.USER) {
        sendUserMessage(payload);
      } else {
        sendGroupChatMessage(payload);
      }
      // new Audio(audioUrl).play();
      messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendUserMessage = (param: sendMessageFn) => {
    const payload: ISingleUserChat = {
      message: param?.message,
      messageType: param?.messageType,
      mediaUrl: param?.mediaUrl,
      receiverId: currentChatUser?._id ?? '',
      sentAt: new Date().toISOString(),
      senderId: authState?.user?._id ?? '',
    };
    dispatch(pushNewMessage({ id: payload?.receiverId, chat: payload }));
    dispatch(
      pushNewCurrentChat({
        ...payload,
        _id: crypto.randomUUID(),
        type: ChatTypeEnum.USER,
      })
    );
    socket?.emit('SEND_MESSAGE', payload);
  };

  const sendGroupChatMessage = (param: sendMessageFn) => {
    const payload: IChat = {
      message: param?.message,
      messageType: param?.messageType,
      mediaUrl: param?.mediaUrl,
      sentAt: new Date().toISOString(),
      senderId: authState?.user?._id ?? '',
    };

    socket?.emit('SEND_GROUP_MESSAGE', {
      groupId: currentChatGroup?._id,
      payload: payload,
    });
  };

  const openUserList = () => {
    setToggleUserList(true);
    navigate('/');
  };
  const isGroupChat = params?.chatType === ChatTypeEnum.GROUP_CHAT;
  const chatMessages = isGroupChat
    ? chatState?.chatGroupMessages?.[currentChatGroup?._id]
    : chatState?.chats[currentChatUser?._id];

  return (
    <div className="h-full">
      <div className="min-w-full border rounded h-full flex flex-col md:flex-row">
        <div className={`${!toggleUserList && 'hidden'} md:flex md:w-1/4`}>
          <UserList
            onlineUsersList={onlineUsersList}
            userList={chatState?.users}
          />
        </div>

        {(currentChatUser || currentChatGroup) && !toggleUserList && (
          <>
            <CurrentChatWindow
              isGroupChat={isGroupChat}
              messageContainerRef={messageContainerRef}
              chatUser={chatUser}
              messages={chatMessages}
              user={authState?.user!}
              sendMessage={sendMessage}
              openUserList={openUserList}
              chatGroupInfo={{
                userList: currentChatGroup?.userList,
                name: currentChatGroup?.name,
                _id: currentChatGroup?._id,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
