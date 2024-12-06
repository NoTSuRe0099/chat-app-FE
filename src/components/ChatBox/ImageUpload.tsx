import React, { useState } from 'react';
import attachIcon from '../../assets/attachIcon.svg';
import axios from 'axios';
import { MessageType } from '../../Enums';

const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_CLOUD_NAME;
const apiKey = import.meta.env.VITE_API_KEY;
const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

interface IProps {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmitMessage: (params: { messageType: string, mediaUrl?: string; }) => void;
  message: string;
  focusedHandler: () => void;
  blurredHandler: () => void;
}

const ImageUpload = ({
  setMessage,
  message,
  focusedHandler,
  blurredHandler, handleSubmitMessage }: IProps) => {


  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files[0];

    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader?.result);
        setShowModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', uploadPreset);

    axios.post(url, formData)
      .then((response) => {
        //@ts-ignore
        handleSubmitMessage({ messageType: MessageType.MEDIA, mediaUrl: response?.data?.url });
      });

    setShowModal(false);

  };

  const handleCancel = () => {
    setShowModal(false);
    setImage(null);
  };

  return (
    <>
      <label className="cursor-pointer">
        <input
          type="file"
          onChange={handleImageChange}
          className="hidden"
          accept="image/png, image/gif, image/jpeg"
        />
        <img className="w-6 h-6 text-gray-500" src={attachIcon} alt="file-icon" />
      </label>
      <div className="flex justify-center items-center h-screen absolute">
        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
              <div className="p-4">
                <img src={image} alt="Preview" className="w-[500px] h-[300px] object-contain" />
              </div>
              <input
                type="text"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Message"
                className="block w-[490px] py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700 mb-4"
                name="message"
                required
                onFocus={focusedHandler}
                onBlur={blurredHandler}
              />
              <div className="border-t p-4 flex justify-end space-x-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default ImageUpload;
