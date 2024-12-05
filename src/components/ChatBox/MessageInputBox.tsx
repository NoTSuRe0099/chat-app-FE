import EmojiPicker from 'emoji-picker-react';
import React from 'react';
import attachIcon from '../../assets/attachIcon.svg';
import emojiIcon from '../../assets/emojiIcon.svg';
import micIcon from '../../assets/micIcon.svg';
import sendIcon from '../../assets/sendIcon.svg';
import { publicApi } from '../../functions/apiClient';


interface MessageInputBoxProps {
  handleSubmitMessage: () => void;
  handleEmoji: (emojiObject: any) => void;
  setIsEmojiDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEmojiDrawerOpen: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  focusedHandler: () => void;
  blurredHandler: () => void;
}

const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_CLOUD_NAME;
const apiKey = import.meta.env.VITE_API_KEY;
const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

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
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e?.target?.files;
    e.target.files = null;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      formData.append('api_key', apiKey);

      publicApi(url, {
        method: 'POST',
        data: formData,
      })
        .then((response) => {
          console.log('cloudnary', response);
        });

    }

  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitMessage();
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
      <button className="w-6 h-6 text-gray-500" type="button">
        <input type="file" onChange={uploadFile} />
        <img className="text-gray-500" src={attachIcon} alt="file-icon" />
      </button>

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
