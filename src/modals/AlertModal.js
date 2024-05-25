// ModalComponent.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModalComponent = ({ show, handleClose, message }) => {
  const navigate = useNavigate();

  const nextPage = () => {
    navigate('/reference');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-medium">Alert</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="mt-4">
          <p>{message}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={nextPage}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            See Reference Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
