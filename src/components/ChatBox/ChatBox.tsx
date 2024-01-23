import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAllUser } from '../../Actions/ChatActions';
import { selectAuth } from '../../auth/AuthSlice';
import { useSocket } from '../../context/SocketContext';
import CurrentChatWindow, { chatUser } from './CurrentChatWindow';
import UserList from './UserList';
import {
  IChat,
  User,
  flushMessages,
  pushNewMessage,
  selectChatState,
} from './chatSlice';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);
  const authState = useSelector(selectAuth);
  const audioRef = useRef(null);
  const params = useParams();
  const [currentChatUser, setCurrentChatUser] = useState<User | null>(null);
  const [onlieUsersList, setOnlieUsersList] = useState<string[]>([]);
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (params?.userId) {
      const user = chatState?.users?.find(
        (user) => user?._id === params?.userId
      );

      setCurrentChatUser(user!);
    }
  }, [params?.userId]);

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

  const sendNotification = (data: IChat) => {
    const userObj = getUserByUserId(data?.senderId);
    const message = `${userObj?.name}: ${data?.message}`;

    // create a notification object
    const greeting = new Notification(`New Message from: ${userObj?.name}`, {
      body: message,
      icon: './img/goodday.png',
    });

    greeting.addEventListener('click', function () {
      const targetURL = `http://localhost:4000/chat/${userObj?._id}`;

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

  useEffect(() => {
    if (socket) {
      socket.on('RECEIVE_MESSAGE', (data: IChat) => {
        dispatch(pushNewMessage({ id: data?.senderId, chat: data }));
        //? auto Scroll
        messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });

        if (document.hidden) {
          if (Notification.permission === 'granted') {
            sendNotification(data);
          }
        } else {
          const userId = location.href.split('/chat')[1]
            ? String(location.href.split('/chat')[1])?.replace('/', '')
            : '';

          if (userId !== data?.senderId) {
            const user = getUserByUserId(data?.senderId);

            toast((t) => (
              <span className="flex gap-2 items-center">
                New Message from <b>{user?.name}</b>
                <button
                  className="px-3 py-2 font-medium bg-blue-50 hover:bg-blue-100 hover:text-blue-600 text-blue-500 rounded-lg text-sm"
                  onClick={() => {
                    navigate(`/chat/${data?.senderId}`);
                    toast.dismiss(t.id);
                  }}
                >
                  Open Chat
                </button>
              </span>
            ));
          }
        }
      });

      socket.on('UPDATED_ONLINE_USERS', (data: string[]) => {
        setOnlieUsersList(data);
      });

      return () => {
        socket.off('RECEIVE_MESSAGE');
        socket.off('UPDATED_ONLINE_USERS');
      };
    }
  }, [socket]);

  const sendMessage = (message: string) => {
    if (socket) {
      const payload: IChat = {
        message: message,
        receiverId: currentChatUser?._id ?? '',
        sentAt: new Date().toISOString(),
        senderId: authState?.user?._id ?? '',
      };

      dispatch(pushNewMessage({ id: payload?.receiverId, chat: payload }));
      socket.emit('SEND_MESSAGE', payload);

      messageContainerRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const chatUser: chatUser = {
    ...currentChatUser!,
    isOnline: onlieUsersList?.includes(currentChatUser?._id!),
  };
  const audioUrl = '/notification-sound-7062.mp3';
  return (
    <div className="h-full">
      <audio className="hidden" ref={audioRef} src={audioUrl} />
      <div className="min-w-full border rounded h-full flex flex-col md:flex-row">
        <UserList onlieUsersList={onlieUsersList} userList={chatState?.users} />

        {currentChatUser && (
          <>
            <CurrentChatWindow
              messageContainerRef={messageContainerRef}
              chatUser={chatUser}
              messages={chatState?.chats[currentChatUser?._id]}
              user={authState?.user!}
              sendMessage={sendMessage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
