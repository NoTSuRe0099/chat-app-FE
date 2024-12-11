import EmojiPicker from 'emoji-picker-react';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageType } from '../../Enums';
import { IGroupDetails } from '../../Types/chatSliceTypes';
import emojiIcon from '../../assets/emojiIcon.svg';
import micIcon from '../../assets/micIcon.svg';
import sendIcon from '../../assets/sendIcon.svg';
import { User } from '../../auth/AuthSlice';
import ImageUpload from './ImageUpload';

interface MessageInputBoxProps {
  handleSubmitMessage: (params: {
    messageType: string;
    mediaUrl?: string;
  }) => void;
  handleEmoji: (emojiObject: any) => void;
  setIsEmojiDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEmojiDrawerOpen: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  focusedHandler: () => void;
  blurredHandler: () => void;
  activlyTypingUserList: Record<string, boolean>;
  chatUser: User;
  chatGroupInfo: IGroupDetails;
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({
  handleSubmitMessage,
  handleEmoji,
  setIsEmojiDrawerOpen,
  isEmojiDrawerOpen,
  setMessage,
  message,
  focusedHandler,
  blurredHandler,
  activlyTypingUserList,
  chatUser,
  chatGroupInfo
}) => {
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const { id } = params;
  const isUserTyping = activlyTypingUserList?.[chatUser?._id] && (id === chatUser?._id || id === chatGroupInfo?._id);

  const handleEmojiClick = (emojiObject: any) => {
    handleEmoji(emojiObject);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (message && !showModal) {
          handleSubmitMessage({ messageType: MessageType.TEXT });
        }
      }}
      autoComplete="off"
      className="flex items-center justify-between w-full p-3 border-t border-gray-300 min-h-[41px] relative"
    >
      {isUserTyping && (
        <div className="typing-indicator typing-in-chat-box-indicator absolute bottom-2">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEmojiDrawerOpen((prev) => !prev);
        }}
        className="w-6 h-6 text-gray-500 relative"
        type="button"
      >
        <div
          className="absolute bottom-14"
          onClick={(e) => e.stopPropagation()}
        >
          {isEmojiDrawerOpen && (
            <div className="relative">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
              <button
                onClick={() => setIsEmojiDrawerOpen(false)}
                className="absolute -top-2 -right-10 mt-2 mr-2 text-gray-500 w-7 h-7 bg-white shadow-sm flex justify-center items-center rounded-md text-xl"
                type="button"
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <img className="text-gray-500" src={emojiIcon} alt="emoji-icon" />
      </button>

      <ImageUpload
        setMessage={setMessage}
        message={message}
        focusedHandler={focusedHandler}
        blurredHandler={blurredHandler}
        handleSubmitMessage={handleSubmitMessage}
        showModal={showModal}
        setShowModal={setShowModal}
      />

      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        placeholder="Message"
        className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
        name="message"
        onFocus={focusedHandler}
        onBlur={blurredHandler}
      />
      <button className="w-6 h-6" type="button">
        <img src={micIcon} alt="mic-icon" />
      </button>
      <button className="w-6 h-6 rotate-90" type="submit">
        <img src={sendIcon} alt="send-icon" />
      </button>
    </form>
  );
};

export default MessageInputBox;
