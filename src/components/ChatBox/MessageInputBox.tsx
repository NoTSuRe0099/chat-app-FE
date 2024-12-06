import EmojiPicker from 'emoji-picker-react';
import React from 'react';
import emojiIcon from '../../assets/emojiIcon.svg';
import micIcon from '../../assets/micIcon.svg';
import sendIcon from '../../assets/sendIcon.svg';
import ImageUpload from './ImageUpload';
import { MessageType } from '../../Enums';


interface MessageInputBoxProps {
  handleSubmitMessage: (params: { messageType: string, mediaUrl?: string; }) => void;
  handleEmoji: (emojiObject: any) => void;
  setIsEmojiDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEmojiDrawerOpen: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  focusedHandler: () => void;
  blurredHandler: () => void;
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
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitMessage({ messageType: MessageType.TEXT });
      }}
      className="flex items-center justify-between w-full p-3 border-t border-gray-300 min-h-[41px]"
    >
      <button
        onClick={() => setIsEmojiDrawerOpen((prev) => !prev)}
        className="w-6 h-6 text-gray-500 relative"
        type="button"
      >
        <div className="absolute bottom-14">
          <EmojiPicker onEmojiClick={handleEmoji} open={isEmojiDrawerOpen} />
        </div>
        <img className="text-gray-500" src={emojiIcon} alt="emoji-icon" />
      </button>

      <ImageUpload setMessage={setMessage}
        message={message}
        focusedHandler={focusedHandler}
        blurredHandler={blurredHandler}
        handleSubmitMessage={handleSubmitMessage} />

      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        placeholder="Message"
        className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
        name="message"
        required
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
