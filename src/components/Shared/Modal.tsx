import { FC } from 'react';
import closeIcon from '../../assets/closeIcon.svg';

interface IModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: FC<IModalProps> = ({ onClose, title, children }) => {
  return (
    <div className="flex justify-center items-center w-screen h-screen absolute left-0 top-0 z-10 bg-black bg-opacity-50">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2">
          <img className="h-3" src={closeIcon} alt="Close" />
        </button>
        <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
