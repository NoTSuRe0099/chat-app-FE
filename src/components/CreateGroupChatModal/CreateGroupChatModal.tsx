import React, { useState } from 'react';
import callApi from '../../functions/apiClient';
import { useSocket } from '../../context/SocketContext';

interface Iprops {
  isModalOpen: boolean;
  closeModal: () => void;
}

const CreateGroupChatModal = (props: Iprops) => {
  const { isModalOpen, closeModal } = props;
  const [groupName, setGroupName] = useState('');
  const { socket } = useSocket();

  const createNewChatGroup = async () => {
    await callApi({
      url: '/chat/createNewChatGroup',
      method: 'POST',
      data: {},
    }).then((response) => {
      //@ts-ignore
      const group = response.data?.data;
      socket.emit('JOIN_GROUP', { groupId: group?._id });
      closeModal();
    });
  };

  if (!isModalOpen) return null;
  return (
    <div className="w-screen h-screen flex justify-center items-center absolute left-0 top-0 z-50 overflow-y-auto overflow-x-hidden bg-black bg-opacity-20">
      <div className="w-full max-w-lg">
        <div className="relative w-full max-w-md max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow ">
            {/* <!-- Modal header --> */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
              <h3 className="text-xl font-semibold text-gray-900 ">
                Create New Group
              </h3>
              <button
                onClick={closeModal}
                type="button"
                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                data-modal-hide="authentication-modal"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* <!-- Modal body --> */}
            <div className="p-4 md:p-5">
              <form
                onSubmit={(e) => {
                  e?.preventDefault();
                  createNewChatGroup();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Group Name
                  </label>
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    placeholder="Enter group name"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e?.target?.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChatModal;
