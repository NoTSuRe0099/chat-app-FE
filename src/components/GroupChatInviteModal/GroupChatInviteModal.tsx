import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGroupChatUserForInvite,
  sendGroupInviteToUser,
} from '../../Actions/ChatActions';
import {
  selectChatState,
  setGroupChatUserForInvite,
} from '../ChatBox/chatSlice';
import Modal from '../Shared/Modal';

interface IGroupChatInviteModalProps {
  onClose: () => void;
  groupId: string;
}

const GroupChatInviteModal: FC<IGroupChatInviteModalProps> = ({
  onClose,
  groupId,
}) => {
  const dispatch = useDispatch();
  const chatState = useSelector(selectChatState);

  useEffect(() => {
    dispatch(
      // @ts-ignore
      fetchGroupChatUserForInvite({
        groupId: groupId,
      })
    );

    return () => {
      dispatch(setGroupChatUserForInvite([]));
    };
  }, [groupId]);

  const sendInviteHandler = (receiverId: string) => {
    dispatch(
      //@ts-ignore
      sendGroupInviteToUser({
        receiverId: receiverId,
        groupId: groupId,
      })
    );
  };

  return (
    <Modal onClose={onClose} title="Invite To Group">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left bg-gray-100">
            <th className="py-2 px-3 text-gray-700">Name</th>
            <th className="py-2 px-3 text-center text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chatState?.usersForGroupInvt?.map((user) => (
            <tr key={user?._id} className="border-b border-gray-200">
              <td className="py-2 px-3 text-gray-800">{user?.name}</td>
              <td className="py-2 px-3 flex justify-center space-x-2">
                <button
                  onClick={() => sendInviteHandler(user?._id)}
                  className="bg-green-500 text-white py-1 px-3 text-xs rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-slate-500"
                  disabled={user?.requestExists}
                >
                  {user?.requestExists ? 'Sent' : 'Send'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
};

export default GroupChatInviteModal;
