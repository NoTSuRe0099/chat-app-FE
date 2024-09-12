import React from 'react';
import Modal from '../Shared/Modal';
import { IGroupInvites } from '../../Types/chatSliceTypes';

interface IGroupInvitationsModal {
  onClose: () => void;
  title: string;
  groupInvites: IGroupInvites[];
  groupInvitationActionHandler: (invitationId: string, isAccepted: boolean) => void;
}

const GroupInvitationsModal: React.FC<IGroupInvitationsModal> = (props) => {
  const { onClose, title, groupInvites, groupInvitationActionHandler } = props;
  const generateInvitationMessage = (invite: IGroupInvites): string => {
    return `${invite.sender_details.name} has invited you to join the group "${invite.group_details.name}".`;
  };
  return (
    <Modal onClose={onClose} title={title}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left bg-gray-100">
            <th className="py-2 px-3 text-gray-700">Title</th>
            <th className="py-2 px-3 text-center text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupInvites?.map((invitation) => (
            <tr key={invitation?._id} className="border-b border-gray-200">
              <td className="py-2 px-3 text-gray-800">
                {generateInvitationMessage(invitation)}
              </td>
              <td className="py-2 px-3 flex justify-center space-x-2">
                <button
                  onClick={() => groupInvitationActionHandler(invitation?._id, true)}
                  className="bg-green-500 text-white py-1 px-3 text-xs rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-slate-500"
                >
                  Accept
                </button>

                <button
                  onClick={() => groupInvitationActionHandler(invitation?._id, false)}
                  className="bg-red-500 text-white py-1 px-3 text-xs rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-slate-500"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
};

export default GroupInvitationsModal;
