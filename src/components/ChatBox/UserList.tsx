import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { logoutAction } from '../../Actions/AuthActions';
import {
  fetchGroupChatInvites,
  fetchMyChatgroups,
  groupInvitationAction,
} from '../../Actions/ChatActions';
import { ChatTypeEnum } from '../../Enums';
import { User } from '../../Types/chatSliceTypes';
import { selectAuth } from '../../auth/AuthSlice';
import CreateGroupChatModal from '../CreateGroupChatModal/CreateGroupChatModal';
import { clearCurrentChat, selectChatState } from './chatSlice';
import { useSocket } from '../../context/SocketContext';
import notificationIcon from '../../assets/notificationIcon.svg';
import activeNotification from '../../assets/activeNotification.svg';
import GroupInvitationsModal from '../GroupInvitationsModal/GroupInvitationsModal';

interface IProps {
  userList: User[];
  onlineUsersList: string[];
}

const UserList = ({ userList = [], onlineUsersList }: IProps) => {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const { socket } = useSocket();
  const chatState = useSelector(selectChatState);
  const authState = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chatGroups, currentUsersGroupInvites, activlyTypingUserList } = chatState;
  const params = useParams();

  useEffect(() => {
    dispatch(fetchMyChatgroups(null) as any);
    dispatch(fetchGroupChatInvites(null) as any);
  }, [dispatch]);

  useEffect(() => {
    chatGroups?.forEach((group) => {
      socket?.emit('JOIN_GROUP', { groupId: group?._id });
    });
  }, [chatGroups, socket]);

  const openCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
  };

  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  const logoutHandler = () => {
    dispatch(logoutAction() as any);
    navigate('/login');
  };

  const getRecentMessage = (userId: string): string => {
    const chatObj = chatState?.chats?.[userId]?.slice(-1)[0];
    return chatObj
      ? chatObj.senderId === authState.user?._id
        ? `You: ${chatObj.message}`
        : chatObj.message
      : 'No Messages';
  };

  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  const groupInvitationActionHandler = (invitationId: string, isAccepted: boolean) => {
    dispatch(groupInvitationAction({ id: invitationId, isAccepted }) as any);
  };

  const handleChatClick = (id: string, type: ChatTypeEnum) => {
    if (params?.id !== id) {
      dispatch(clearCurrentChat());
      navigate(`/chat/${type}/${id}`);
    }
  };

  return (
    <>
      {isNotificationModalOpen && (
        <GroupInvitationsModal
          onClose={closeNotificationModal}
          title="Notifications"
          groupInvites={currentUsersGroupInvites}
          groupInvitationActionHandler={groupInvitationActionHandler}
        />
      )}
      <div className="border-r border-gray-300 w-full flex flex-col h-screen">
        <div className="mx-3 my-3 flex gap-2">
          <div className="relative text-gray-600 w-[90%]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-gray-300"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              className="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"
              name="search"
              placeholder="Search"
              required
            />
          </div>
          <div className="w-10">
            <button
              className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full"
              onClick={openNotificationModal}
            >
              <img
                className="h-6"
                src={
                  currentUsersGroupInvites?.length > 0
                    ? activeNotification
                    : notificationIcon
                }
                alt="notificationIcon"
              />
            </button>
          </div>
        </div>
        <ul className="overflow-y-auto h-full">
          <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
          <>
            {userList.map((user) => (
              <li
                onClick={() => handleChatClick(user?._id, ChatTypeEnum.USER)}
                key={user?._id}
                className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
              >
                <div className="relative flex items-center p-3">
                  <img
                    className="object-cover w-10 h-10 rounded-full"
                    src="https://static.vecteezy.com/system/resources/previews/026/619/142/non_2x/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
                    alt="username"
                  />
                  <span
                    className={`absolute w-3 h-3 ${onlineUsersList?.includes(user?._id) ? 'bg-green-600' : 'bg-red-600'} rounded-full left-10 top-3`}
                  ></span>
                </div>
                <div className="w-full pb-2">
                  <div className="flex justify-between">
                    <span className="block ml-2 font-semibold text-gray-600">
                      {user?.name}
                    </span>
                  </div>
                  <span className="block ml-2 text-sm text-gray-600">
                    {activlyTypingUserList?.[user?._id] ? (
                      <div className="typing-indicator mt-2">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    ) : (
                      getRecentMessage(user?._id)
                    )}
                  </span>
                </div>
              </li>
            ))}
            {chatGroups?.map((group) => (
              <li
                onClick={() => handleChatClick(group?._id, ChatTypeEnum.GROUP_CHAT)}
                key={group?._id}
                className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
              >
                <div className="relative flex items-center p-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex justify-center items-center">
                    <img
                      className="object-cover w-7 h-7"
                      src="https://icon-library.com/images/group-chat-icon/group-chat-icon-13.jpg"
                      alt="group"
                    />
                  </div>
                </div>
                <div className="w-full pb-2">
                  <div className="flex justify-between">
                    <span className="block ml-2 font-semibold text-gray-600">
                      {group?.name}
                    </span>
                  </div>
                  <span className="block ml-2 text-sm text-gray-600">
                    {getRecentMessage(group?._id)}
                  </span>
                </div>
              </li>
            ))}
          </>
        </ul>
        <div>
          <div className="w-full px-3">
            <button
              onClick={openCreateGroupModal}
              className="flex justify-center items-center w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-md my-4"
            >
              <h1 className="text-md font-semibold text-gray-700">Create Group</h1>
            </button>
          </div>
          <li className="flex items-center justify-between text-sm transition duration-150 ease-in-out border-b border-t border-gray-300 cursor-pointer bg-gray-100 focus:outline-none pr-3">
            <div className="flex items-center">
              <div className="relative flex items-center p-3">
                <img
                  className="object-cover w-10 h-10 rounded-full"
                  src="https://static.vecteezy.com/system/resources/previews/026/619/142/non_2x/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
                  alt="username"
                />
              </div>
              <div className="block ml-2 font-semibold text-gray-600">
                {authState?.user?.name}
              </div>
            </div>
            <button onClick={logoutHandler} className="text-md font-semibold text-gray-700">
              Logout
            </button>
          </li>
        </div>
      </div>
      <CreateGroupChatModal isModalOpen={isCreateGroupModalOpen} closeModal={closeCreateGroupModal} />
    </>
  );
};

export default UserList;
