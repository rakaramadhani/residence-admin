import React from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

const Modal = ({ children, onClose, title }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full relative">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium text-lg">{title || "Modal"}</h3>
        <button
          className="text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  </div>
);

export default Modal;